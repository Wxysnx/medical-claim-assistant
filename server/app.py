from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import anthropic
import os
from dotenv import load_dotenv

from database import get_db, Claim

# 加载环境变量
load_dotenv()

app = FastAPI()

# 配置CORS，允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost", "http://127.0.0.1:3000"],  # React默认端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic模型用于API请求和响应
class ClaimRequest(BaseModel):
    patient_name: str
    service_date: str
    cpt_code: str
    icd10_codes: str
    denial_reason: str
    insurance_company: str
    claim_amount: float
    additional_info: Optional[str] = None

class AppealResponse(BaseModel):
    appeal_letter: str
    success_probability: str
    strategies: List[str]
    claim_id: int

# 初始化Anthropic客户端
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# 生成上诉信的函数
def generate_appeal_letter(claim_data: ClaimRequest):
    # 构建prompt模板
    prompt = f"""
    你是一位美国医疗保险索赔专家，专门负责帮助医疗机构针对被拒绝的医保索赔编写专业上诉信。
    
    请基于以下信息生成一封专业的医保索赔上诉信:
    
    患者姓名: {claim_data.patient_name}
    服务日期: {claim_data.service_date}
    CPT码: {claim_data.cpt_code}
    ICD-10诊断码: {claim_data.icd10_codes}
    拒绝原因: {claim_data.denial_reason}
    保险公司: {claim_data.insurance_company}
    索赔金额: ${claim_data.claim_amount}
    额外临床信息: {claim_data.additional_info or "无"}
    
    请提供以下内容:
    1. 一封专业格式的上诉信，包括所有必要的组成部分（信头、日期、主题行、称呼、正文、结束语和签名）
    2. 基于提供的临床信息和拒绝原因，阐述上诉的医疗必要性论点
    3. 引用相关的医疗指南、保险政策或医学文献来支持你的论点
    4. 这封上诉信成功的概率评估（高、中或低）
    5. 3-5条提高上诉成功率的策略建议
    
    请确保上诉信专业、简洁且有说服力，针对特定的拒绝原因提出有力的反驳。
    """

    # 调用Claude API
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        temperature=0.2,  # 使用较低的温度以确保专业和一致的输出
        system="你是一位经验丰富的美国医疗保险索赔专家，擅长编写医保索赔上诉信。你的回答应该专业、准确且符合医疗保险行业标准。",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    
    # 解析Claude的响应
    response_text = message.content[0].text
    
    # 分离上诉信、成功率评估和策略
    sections = response_text.split("\n\n")
    appeal_letter = ""
    success_probability = "中等"  # 默认值
    strategies = []
    
    # 提取上诉信内容（前半部分）和其他内容
    in_letter = True
    for section in sections:
        if "成功概率" in section or "Success Probability" in section:
            in_letter = False
            if "高" in section or "High" in section.lower():
                success_probability = "高"
            elif "低" in section or "Low" in section.lower():
                success_probability = "低"
            else:
                success_probability = "中等"
        elif "策略建议" in section or "Strategy" in section:
            in_letter = False
            # 提取策略列表
            strategy_lines = [line.strip() for line in section.split("\n") if line.strip() and ("•" in line or "-" in line or any(str(i) in line for i in range(1, 6)))]
            if strategy_lines:
                strategies = strategy_lines
        elif in_letter:
            appeal_letter += section + "\n\n"
    
    # 如果无法正确分离内容，则整体返回
    if not strategies:
        strategies = ["提供更多详细的医疗记录", "强调医疗必要性", "引用相关医疗指南"]
    
    return {
        "appeal_letter": appeal_letter.strip(),
        "success_probability": success_probability,
        "strategies": strategies
    }

# API端点
@app.post("/api/generate-appeal", response_model=AppealResponse)
def create_appeal(claim: ClaimRequest, db: Session = Depends(get_db)):
    try:
        # 调用Claude API生成上诉信
        appeal_result = generate_appeal_letter(claim)
        
        # 转换服务日期字符串为日期对象
        service_date = datetime.strptime(claim.service_date, "%Y-%m-%d")
        
        # 创建新的索赔记录
        db_claim = Claim(
            patient_name=claim.patient_name,
            service_date=service_date,
            cpt_code=claim.cpt_code,
            icd10_codes=claim.icd10_codes,
            denial_reason=claim.denial_reason,
            insurance_company=claim.insurance_company,
            claim_amount=claim.claim_amount,
            additional_info=claim.additional_info,
            appeal_text=appeal_result["appeal_letter"],
            appeal_status="generated"
        )
        
        # 保存到数据库
        db.add(db_claim)
        db.commit()
        db.refresh(db_claim)
        
        # 返回结果，包括生成的上诉信和策略
        return {
            "appeal_letter": appeal_result["appeal_letter"],
            "success_probability": appeal_result["success_probability"],
            "strategies": appeal_result["strategies"],
            "claim_id": db_claim.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 获取历史索赔记录
@app.get("/api/claims")
def get_claims(db: Session = Depends(get_db)):
    claims = db.query(Claim).order_by(Claim.created_at.desc()).all()
    return claims

# 获取单个索赔记录详情
@app.get("/api/claims/{claim_id}")
def get_claim(claim_id: int, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)