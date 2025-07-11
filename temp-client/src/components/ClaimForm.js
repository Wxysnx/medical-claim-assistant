import React, { useState } from 'react';
import '../styles/ClaimForm.css';

const ClaimForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    service_date: '',
    cpt_code: '',
    icd10_codes: '',
    denial_reason: '',
    insurance_company: '',
    claim_amount: '',
    additional_info: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const denialReasons = [
    "Frequency limitation exceeded", 
    "Not medically necessary", 
    "Non-covered service", 
    "Missing documentation", 
    "Coding error", 
    "Duplicate claim", 
    "Timely filing", 
    "Patient eligibility", 
    "Authorization required", 
    "Other"
  ];

  const insuranceCompanies = [
    "Anthem Blue Cross",
    "Blue Shield",
    "UnitedHealthcare",
    "Cigna",
    "Aetna",
    "Medicare",
    "Medicaid",
    "Kaiser Permanente",
    "Humana",
    "Other"
  ];

  return (
    <div className="claim-form-container">
      <h2>医保索赔上诉信息</h2>
      <form onSubmit={handleSubmit} className="claim-form">
        <div className="form-group">
          <label htmlFor="patient_name">患者姓名</label>
          <input
            type="text"
            id="patient_name"
            name="patient_name"
            value={formData.patient_name}
            onChange={handleChange}
            required
            placeholder="例如：John Doe"
          />
        </div>

        <div className="form-group">
          <label htmlFor="service_date">服务日期</label>
          <input
            type="date"
            id="service_date"
            name="service_date"
            value={formData.service_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cpt_code">CPT代码</label>
          <input
            type="text"
            id="cpt_code"
            name="cpt_code"
            value={formData.cpt_code}
            onChange={handleChange}
            required
            placeholder="例如：99214"
          />
        </div>

        <div className="form-group">
          <label htmlFor="icd10_codes">ICD-10诊断码</label>
          <input
            type="text"
            id="icd10_codes"
            name="icd10_codes"
            value={formData.icd10_codes}
            onChange={handleChange}
            required
            placeholder="例如：E11.9, I10（多个代码用逗号分隔）"
          />
        </div>

        <div className="form-group">
          <label htmlFor="denial_reason">拒绝原因</label>
          <select
            id="denial_reason"
            name="denial_reason"
            value={formData.denial_reason}
            onChange={handleChange}
            required
          >
            <option value="">选择拒绝原因</option>
            {denialReasons.map(reason => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="insurance_company">保险公司</label>
          <select
            id="insurance_company"
            name="insurance_company"
            value={formData.insurance_company}
            onChange={handleChange}
            required
          >
            <option value="">选择保险公司</option>
            {insuranceCompanies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="claim_amount">索赔金额</label>
          <div className="input-prefix">
            <span className="prefix">$</span>
            <input
              type="number"
              id="claim_amount"
              name="claim_amount"
              value={formData.claim_amount}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="例如：162.00"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="additional_info">额外临床信息</label>
          <textarea
            id="additional_info"
            name="additional_info"
            value={formData.additional_info}
            onChange={handleChange}
            rows="4"
            placeholder="提供相关的临床信息，如病人病史、当前症状、特殊情况等"
          ></textarea>
        </div>

        <div className="form-group full-width">
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? '生成中...' : '生成上诉信'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClaimForm;