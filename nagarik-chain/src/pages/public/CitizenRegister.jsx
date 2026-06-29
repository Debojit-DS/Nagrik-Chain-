import { useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Fingerprint,
  MapPin,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  ScanFace,
} from 'lucide-react';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import { generateNagarikId } from '@utils/formatters';
import { generateHash } from '@utils/hashGenerator';
import ashokaChakra from '@/assets/ashoka-chakra.svg';

const steps = [
  { icon: User, label: 'Personal Info' },
  { icon: Fingerprint, label: 'Biometric Consent' },
  { icon: MapPin, label: 'Address & Docs' },
  { icon: CheckCircle, label: 'Review & Submit' },
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

function CitizenRegister() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [form, setForm] = useState({
    fullName: '', dob: '', gender: '', mobile: '', email: '',
    biometricConsent: false, dataConsent: false,
    fpScanned: false, faceScanned: false,
    state: '', district: '', pinCode: '', address: '',
    declaration: false,
  });

  const updateForm = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: return form.fullName && form.dob && form.gender && form.mobile;
      case 1: return form.biometricConsent && form.dataConsent;
      case 2: return form.state && form.district && form.pinCode && form.address;
      case 3: return form.declaration;
      default: return false;
    }
  }, [currentStep, form]);

  const handleNext = useCallback(() => {
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleScanFP = useCallback(() => {
    updateForm('fpScanned', 'scanning');
    setTimeout(() => updateForm('fpScanned', true), 2000);
  }, [updateForm]);

  const handleScanFace = useCallback(() => {
    updateForm('faceScanned', 'scanning');
    setTimeout(() => updateForm('faceScanned', true), 2000);
  }, [updateForm]);

  const handleSubmit = useCallback(async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 3000));
    const id = generateNagarikId();
    setGeneratedId(id);
    setGenerating(false);
    setShowSuccess(true);
  }, []);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-green-900/40 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>
          <h2 className="text-display-md text-brand-white mb-3">Identity Generated!</h2>
          <p className="text-brand-muted mb-6">Your Nagarik Chain identity has been anchored to the blockchain.</p>
          <div className="bg-brand-navy-mid border border-brand-navy-light rounded-xl p-6 mb-6">
            <p className="text-brand-muted text-xs uppercase tracking-wider mb-2">Your Nagarik ID</p>
            <p className="font-mono text-2xl text-brand-crypto-blue font-bold">{generatedId}</p>
            <p className="font-mono text-xs text-brand-muted mt-2">
              Block Hash: {generateHash(64).slice(0, 20)}...
            </p>
          </div>
          <Link to="/citizen/login">
            <Button className="w-full">Proceed to Login →</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <img
            src={ashokaChakra}
            alt=""
            className="w-7 h-7"
            style={{ filter: 'invert(45%) sepia(100%) saturate(1000%) hue-rotate(360deg)' }}
          />
          <span className="font-display font-bold text-sm text-brand-white tracking-wider">
            NAGARIK CHAIN — Registration
          </span>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <div key={step.label} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isDone
                      ? 'bg-brand-saffron text-white'
                      : isActive
                        ? 'bg-brand-navy-light border-2 border-brand-saffron text-brand-saffron'
                        : 'bg-brand-navy-mid border border-brand-navy-light text-brand-muted'
                  }`}
                >
                  {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${isActive ? 'text-brand-white' : 'text-brand-muted'}`}>
                  {step.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${isDone ? 'bg-brand-saffron' : 'bg-brand-navy-light'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-brand-navy-mid border border-brand-navy-light rounded-2xl p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step 0: Personal Info */}
              {currentStep === 0 && (
                <div className="space-y-5">
                  <h3 className="font-display font-bold text-xl text-brand-white mb-4">Personal Information</h3>
                  <Input id="full-name" label="Full Name" placeholder="Enter your full name" value={form.fullName} onChange={(e) => updateForm('fullName', e.target.value)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input id="dob" label="Date of Birth" type="date" value={form.dob} onChange={(e) => updateForm('dob', e.target.value)} />
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-brand-white mb-1.5">Gender</label>
                      <select id="gender" value={form.gender} onChange={(e) => updateForm('gender', e.target.value)} className="w-full px-4 py-2.5 bg-brand-navy border border-brand-navy-light rounded-lg text-brand-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-saffron">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <Input id="mobile" label="Mobile Number" placeholder="+91 XXXXX XXXXX" value={form.mobile} onChange={(e) => updateForm('mobile', e.target.value)} />
                  <Input id="email" label="Email (Optional)" placeholder="your@email.com" value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
                </div>
              )}

              {/* Step 1: Biometric Consent */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-xl text-brand-white mb-2">Biometric Consent</h3>
                  <p className="text-body-sm text-brand-muted">
                    Your biometric data will be securely stored and used solely for identity verification.
                    Data is encrypted with AES-256 and never leaves sovereign infrastructure.
                  </p>

                  {/* Consent Toggles */}
                  <div className="space-y-4">
                    {[
                      { field: 'biometricConsent', label: 'I consent to biometric data collection' },
                      { field: 'dataConsent', label: 'I consent to data processing per IT Act 2000' },
                    ].map(({ field, label }) => (
                      <label key={field} className="flex items-center gap-3 cursor-pointer group">
                        <div
                          className={`relative w-11 h-6 rounded-full transition-colors ${form[field] ? 'bg-brand-saffron' : 'bg-brand-navy-light'}`}
                          onClick={() => updateForm(field, !form[field])}
                          role="switch"
                          aria-checked={form[field]}
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && updateForm(field, !form[field])}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form[field] ? 'translate-x-5' : ''}`} />
                        </div>
                        <span className="text-brand-white text-sm">{label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Mock Scans */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={handleScanFP}
                      disabled={form.fpScanned === true}
                      className={`p-6 rounded-xl border text-center transition-all ${
                        form.fpScanned === true
                          ? 'bg-green-900/20 border-green-800 text-green-400'
                          : form.fpScanned === 'scanning'
                            ? 'bg-brand-navy border-brand-saffron text-brand-saffron animate-pulse'
                            : 'bg-brand-navy border-brand-navy-light text-brand-muted hover:border-brand-saffron hover:text-brand-saffron'
                      }`}
                    >
                      <Fingerprint className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">
                        {form.fpScanned === true ? '✓ Fingerprint Scanned' : form.fpScanned === 'scanning' ? 'Scanning...' : 'Scan Fingerprint'}
                      </p>
                    </button>
                    <button
                      onClick={handleScanFace}
                      disabled={form.faceScanned === true}
                      className={`p-6 rounded-xl border text-center transition-all ${
                        form.faceScanned === true
                          ? 'bg-green-900/20 border-green-800 text-green-400'
                          : form.faceScanned === 'scanning'
                            ? 'bg-brand-navy border-brand-saffron text-brand-saffron animate-pulse'
                            : 'bg-brand-navy border-brand-navy-light text-brand-muted hover:border-brand-saffron hover:text-brand-saffron'
                      }`}
                    >
                      <ScanFace className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">
                        {form.faceScanned === true ? '✓ Face Scanned' : form.faceScanned === 'scanning' ? 'Scanning...' : 'Scan Face'}
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Address & Documents */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h3 className="font-display font-bold text-xl text-brand-white mb-4">Address & Documents</h3>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-brand-white mb-1.5">State / UT</label>
                    <select id="state" value={form.state} onChange={(e) => updateForm('state', e.target.value)} className="w-full px-4 py-2.5 bg-brand-navy border border-brand-navy-light rounded-lg text-brand-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-saffron">
                      <option value="">Select State</option>
                      {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input id="district" label="District" placeholder="Your district" value={form.district} onChange={(e) => updateForm('district', e.target.value)} />
                    <Input id="pin-code" label="Pin Code" placeholder="6-digit PIN" value={form.pinCode} onChange={(e) => updateForm('pinCode', e.target.value)} maxLength={6} />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-brand-white mb-1.5">Full Address</label>
                    <textarea
                      id="address"
                      rows={3}
                      value={form.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      placeholder="Enter your full address"
                      className="w-full px-4 py-2.5 bg-brand-navy border border-brand-navy-light rounded-lg text-brand-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-saffron resize-none"
                    />
                  </div>

                  {/* File Upload Zone */}
                  <div className="border-2 border-dashed border-brand-navy-light rounded-xl p-8 text-center hover:border-brand-saffron/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-brand-muted mx-auto mb-2" />
                    <p className="text-brand-white text-sm font-medium">Drop supporting documents here</p>
                    <p className="text-brand-muted text-xs mt-1">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-xl text-brand-white mb-4">Review & Submit</h3>

                  <div className="bg-brand-navy rounded-xl p-5 space-y-3">
                    {[
                      ['Full Name', form.fullName],
                      ['Date of Birth', form.dob],
                      ['Gender', form.gender],
                      ['Mobile', form.mobile],
                      ['Email', form.email || '—'],
                      ['State', form.state],
                      ['District', form.district],
                      ['Pin Code', form.pinCode],
                      ['Biometrics', form.fpScanned === true && form.faceScanned === true ? '✓ Complete' : 'Partial'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-brand-muted">{label}</span>
                        <span className="text-brand-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.declaration}
                      onChange={(e) => updateForm('declaration', e.target.checked)}
                      className="mt-1 accent-brand-saffron w-4 h-4"
                    />
                    <span className="text-brand-muted text-sm leading-relaxed">
                      I declare that all information provided is true to the best of my knowledge.
                      I understand that this identity will be permanently anchored to the Nagarik Chain blockchain.
                    </span>
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-brand-navy-light">
            <div>
              {currentStep > 0 && (
                <Button variant="ghost" onClick={handlePrev}>
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
            </div>
            <div>
              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={!canProceed}>
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed} loading={generating}>
                  {generating ? 'Generating ID...' : 'Generate My Nagarik ID'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link to="/citizen/login" className="text-brand-muted hover:text-brand-white text-sm transition-colors">
            Already registered? Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CitizenRegister;
