'use client';

import { useEffect, useState } from 'react';

const defaultRiskFactors = {
  productCategory: 'general',
  isHazardous: 'no',
  requiresTemperatureControl: 'no',
  isFragile: 'no',
  documentationComplete: 'yes',
  customsClearanceReady: 'yes',
  packagingVerified: 'yes',
};

function calculateRiskAndCompliance(formData) {
  const weight = Number(formData.weight) || 0;
  const value = Number(formData.value) || 0;
  const riskFactors = formData.riskFactors || defaultRiskFactors;

  let riskScore = 10;

  const productRiskMap = {
    general: 10,
    electronics: 20,
    pharmaceuticals: 30,
    chemicals: 40,
    food: 18,
    luxury: 28,
  };

  riskScore += productRiskMap[riskFactors.productCategory] || productRiskMap.general;

  if (riskFactors.isHazardous === 'yes') {
    riskScore += 25;
  }

  if (riskFactors.requiresTemperatureControl === 'yes') {
    riskScore += 12;
  }

  if (riskFactors.isFragile === 'yes') {
    riskScore += 10;
  }

  if (weight > 1000) {
    riskScore += 10;
  } else if (weight > 500) {
    riskScore += 5;
  }

  if (value > 100000) {
    riskScore += 15;
  } else if (value > 50000) {
    riskScore += 8;
  }

  let compliancePercentage = 100;

  if (riskFactors.documentationComplete !== 'yes') {
    compliancePercentage -= 30;
  }

  if (riskFactors.customsClearanceReady !== 'yes') {
    compliancePercentage -= 25;
  }

  if (riskFactors.packagingVerified !== 'yes') {
    compliancePercentage -= 20;
  }

  if (
    riskFactors.isHazardous === 'yes' &&
    riskFactors.documentationComplete !== 'yes'
  ) {
    compliancePercentage -= 15;
  }

  return {
    riskScore: Math.max(0, Math.min(100, Math.round(riskScore))),
    compliancePercentage: Math.max(0, Math.min(100, Math.round(compliancePercentage))),
  };
}

function createInitialFormData(initialData) {
  return {
    shipmentId: initialData?.shipmentId || '',
    origin: initialData?.origin || '',
    destination: initialData?.destination || '',
    status: initialData?.status || 'In Transit',
    currentLocation: initialData?.currentLocation || '',
    cargoType: initialData?.cargoType || '',
    weight: initialData?.weight ?? '',
    value: initialData?.value ?? '',
    departureDate: initialData?.departureDate
      ? initialData.departureDate.split('T')[0]
      : '',
    expectedArrival: initialData?.expectedArrival
      ? initialData.expectedArrival.split('T')[0]
      : '',
    riskScore: initialData?.riskScore ?? 0,
    compliancePercentage: initialData?.compliancePercentage ?? 100,
    riskFactors: {
      ...defaultRiskFactors,
      ...(initialData?.riskFactors || {}),
    },
    notes: initialData?.notes || '',
  };
}

export function ShipmentForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) {
  const [formData, setFormData] = useState(() => createInitialFormData(initialData));

  const handleChange = (e) => {
    const { name, value } = e.target;

    const numericFields = ['weight', 'value'];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? value === ''
          ? ''
          : parseFloat(value)
        : value,
    }));
  };

  const handleRiskFactorChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      riskFactors: {
        ...prev.riskFactors,
        [name]: value,
      },
    }));
  };

  useEffect(() => {
    const { riskScore, compliancePercentage } = calculateRiskAndCompliance(formData);

    setFormData((prev) => {
      if (
        prev.riskScore === riskScore &&
        prev.compliancePercentage === compliancePercentage
      ) {
        return prev;
      }

      return {
        ...prev,
        riskScore,
        compliancePercentage,
      };
    });
  }, [
    formData.cargoType,
    formData.weight,
    formData.value,
    formData.riskFactors,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Shipment ID" name="shipmentId" value={formData.shipmentId} onChange={handleChange} disabled={!!initialData} />
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="In Transit">In Transit</option>
              <option value="At Port">At Port</option>
              <option value="Delayed">Delayed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Route Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="Origin" name="origin" value={formData.origin} onChange={handleChange} />
          <InputField label="Destination" name="destination" value={formData.destination} onChange={handleChange} />
          <InputField label="Current Location" name="currentLocation" value={formData.currentLocation} onChange={handleChange} />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField type="date" label="Departure Date" name="departureDate" value={formData.departureDate} onChange={handleChange} />
          <InputField type="date" label="Expected Arrival" name="expectedArrival" value={formData.expectedArrival} onChange={handleChange} />
        </div>

        {/* Cargo Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="Cargo Type" name="cargoType" value={formData.cargoType} onChange={handleChange} />
          <InputField type="number" label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} />
          <InputField type="number" label="Value (USD)" name="value" value={formData.value} onChange={handleChange} />
        </div>

        <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Risk Assessment Questions</h3>
            <p className="text-sm text-slate-600">
              Risk score and compliance are calculated automatically from these answers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Product Category"
              name="productCategory"
              value={formData.riskFactors.productCategory}
              onChange={handleRiskFactorChange}
              options={[
                { value: 'general', label: 'General Goods' },
                { value: 'electronics', label: 'Electronics' },
                { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
                { value: 'chemicals', label: 'Chemicals' },
                { value: 'food', label: 'Food / Perishable' },
                { value: 'luxury', label: 'Luxury Goods' },
              ]}
            />
            <SelectField
              label="Hazardous Material"
              name="isHazardous"
              value={formData.riskFactors.isHazardous}
              onChange={handleRiskFactorChange}
              options={yesNoOptions}
            />
            <SelectField
              label="Temperature Controlled"
              name="requiresTemperatureControl"
              value={formData.riskFactors.requiresTemperatureControl}
              onChange={handleRiskFactorChange}
              options={yesNoOptions}
            />
            <SelectField
              label="Fragile Cargo"
              name="isFragile"
              value={formData.riskFactors.isFragile}
              onChange={handleRiskFactorChange}
              options={yesNoOptions}
            />
            <SelectField
              label="Documentation Complete"
              name="documentationComplete"
              value={formData.riskFactors.documentationComplete}
              onChange={handleRiskFactorChange}
              options={yesNoOptions}
            />
            <SelectField
              label="Customs Clearance Ready"
              name="customsClearanceReady"
              value={formData.riskFactors.customsClearanceReady}
              onChange={handleRiskFactorChange}
              options={yesNoOptions}
            />
            <SelectField
              label="Packaging Verified"
              name="packagingVerified"
              value={formData.riskFactors.packagingVerified}
              onChange={handleRiskFactorChange}
              options={yesNoOptions}
            />
          </div>
        </div>

        {/* Risk & Compliance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField type="number" label="Risk Score (0-100)" name="riskScore" value={formData.riskScore} min="0" max="100" readOnly />
          <InputField type="number" label="Compliance %" name="compliancePercentage" value={formData.compliancePercentage} min="0" max="100" readOnly />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={3}
            placeholder="Add any notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update' : 'Add'} Shipment
          </button>
        </div>

      </form>
    </div>
  );
}

/* Reusable Input Field */
function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  ...rest
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border p-2 rounded"
        required
        {...rest}
      />
    </div>
  );
}

const yesNoOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border p-2 rounded bg-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ShipmentForm;
