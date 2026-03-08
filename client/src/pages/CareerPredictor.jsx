import { useState } from "react";
import axios from "axios";

export default function CareerPredictor() {
  const [formData, setFormData] = useState({
    gender: "",
    part_time_job: "",
    extracurricular_activities: "",
    weekly_self_study_hours: "",
    math_score: "",
    history_score: "",
    physics_score: "",
    chemistry_score: "",
    biology_score: "",
    english_score: "",
    geography_score: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Score strength with progress bar color logic (from paper form)
  const getScoreStrength = (score) => {
    const num = Number(score);
    if (num >= 90) return { level: "excellent", color: "#2a7a2a", label: "Excellent" };
    if (num >= 80) return { level: "strong", color: "#2a7a2a", label: "Strong" };
    if (num >= 70) return { level: "good", color: "#b87a00", label: "Good" };
    if (num >= 60) return { level: "medium", color: "#b87a00", label: "Medium" };
    if (num >= 50) return { level: "weak", color: "#a83232", label: "Weak" };
    return { level: "poor", color: "#a83232", label: "Poor" };
  };

  // Real-time average calculator (from paper form)
  const avgScore = (() => {
    const scores = [
      "math_score", "physics_score", "chemistry_score", "biology_score",
      "history_score", "english_score", "geography_score"
    ].map(k => Number(formData[k])).filter(v => v > 0);
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
  })();

  const scienceSubjects = [
    { name: "math_score", label: "Mathematics" },
    { name: "physics_score", label: "Physics" },
    { name: "chemistry_score", label: "Chemistry" },
    { name: "biology_score", label: "Biology" },
  ];

  const humanitiesSubjects = [
    { name: "english_score", label: "English" },
    { name: "history_score", label: "History" },
    { name: "geography_score", label: "Geography" },
  ];

  const handleNext = () => {
    const requiredFields = {
      1: ["gender", "part_time_job", "extracurricular_activities", "weekly_self_study_hours"],
      2: scienceSubjects.map(s => s.name),
      3: humanitiesSubjects.map(s => s.name),
    };

    const currentRequired = requiredFields[currentStep];
    const hasEmpty = currentRequired.some(field => !formData[field]);
    
    if (hasEmpty) {
      alert(`Please complete all fields in Section ${String.fromCharCode(64 + currentStep)}`);
      return;
    }

    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const payload = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, Number(v)])
      );
      const response = await axios.post("http://127.0.0.1:5000/predict", payload);
      setResult(response.data);
      setCurrentStep(1);
    } catch (error) {
      console.error(error);
      alert("Prediction failed. Please check that the backend server is running.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-[#b2b0a8] via-[#c8c0b0] to-[#a0a098]">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');
        
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input:focus { outline: none !important; }
        
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes resultSlide { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes progressFill { from { width: 0%; } }
        
        .paper {
          background: #faf8f3;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), 4px 4px 0 #d8d0c0, 8px 8px 0 #ccc4b4;
          border: 2px solid #ddd8cc;
          animation: fadeIn 0.6s ease-out;
          position: relative;
          overflow: hidden;
        }
        
        .paper::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #2a5fa5 0%, #2a5fa5 40%, #ddd8cc 40%);
        }
        
        .section-header {
          display: flex; align-items: center; gap: 12px;
          background: linear-gradient(135deg, #2a5fa5, #3a6bb5);
          margin: 0 -2rem -1rem;
          padding: 12px 2rem;
          color: white;
        }
        
        .section-badge {
          width: 28px; height: 28px; border-radius: 50%;
          background: white; color: #2a5fa5;
          font-weight: 700; font-size: 14px; font-family: 'Libre Baskerville', serif;
          display: flex; align-items: center; justify-content: center;
        }
        
        .score-progress {
          height: 4px; margin-top: 8px; border-radius: 2px;
          background: #ddd; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        
        .score-progress-fill {
          height: 100%; transition: width 0.6s ease, background 0.3s ease;
        }
        
        .avg-score {
          background: linear-gradient(135deg, #edf2fb, #e8f0ff) !important;
          border-left: 4px solid #2a5fa5 !important;
        }
        
        .submit-btn:hover { background: #1e4a8a !important; transform: translateY(-1px); }
        .reset-btn:hover { background: #e8e0d0 !important; }
        .btn-spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
      `}</style>

      <div className="paper w-full max-w-6xl p-12 lg:p-16 rounded-2xl">
        
        {/* Title Block */}
        <div className="mb-12 pb-8 border-b-4 border-l-[40%] border-indigo-600">
          <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-2 font-[Libre_Baskerville] text-slate-900 tracking-tight">
            AI Career Predictor
          </h1>
          <p className="text-lg text-slate-600 italic font-[Libre_Baskerville] tracking-wide">
            Student Assessment Form — Complete all sections accurately
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-sm text-slate-600 mb-3 uppercase tracking-wider font-medium">
            <span>Section {String.fromCharCode(64 + currentStep)} of {String.fromCharCode(64 + totalSteps)}</span>
            <span>{currentStep === 1 ? "Personal" : currentStep === 2 ? "Sciences" : "Humanities"}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* ── A: Personal Info ── */}
          {currentStep === 1 && (
            <div className="section">
              <div className="section-header">
                <div className="section-badge">A</div>
                <span className="uppercase tracking-[3px] font-semibold text-sm">Personal Information</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Gender</label>
                  <div className="flex items-center gap-6 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="gender" value="0" checked={formData.gender === "0"} onChange={handleChange} className="w-5 h-5 accent-indigo-600" required />
                      <span>Male</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="gender" value="1" checked={formData.gender === "1"} onChange={handleChange} className="w-5 h-5 accent-indigo-600" required />
                      <span>Female</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Weekly Self-Study Hours</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-xl border border-slate-200">
                    <input
                      type="number"
                      name="weekly_self_study_hours"
                      value={formData.weekly_self_study_hours}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g. 15"
                      className="flex-1 bg-transparent border-b border-slate-300 outline-none pb-2 text-lg font-semibold text-slate-900 placeholder-slate-400"
                      required
                    />
                    <span className="text-sm text-slate-500 font-medium">hrs/week</span>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Part-Time Job & Extracurriculars</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-r from-slate-50/70 to-indigo-50/30 rounded-2xl border-2 border-slate-200">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-600">Part-time job?</span>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="part_time_job" value="1" checked={formData.part_time_job === "1"} onChange={handleChange} className="w-4 h-4 accent-emerald-600" required />
                          <span className="text-sm">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="part_time_job" value="0" checked={formData.part_time_job === "0"} onChange={handleChange} className="w-4 h-4 accent-emerald-600" required />
                          <span className="text-sm">No</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-600">Extracurricular activities?</span>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="extracurricular_activities" value="1" checked={formData.extracurricular_activities === "1"} onChange={handleChange} className="w-4 h-4 accent-purple-600" required />
                          <span className="text-sm">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="extracurricular_activities" value="0" checked={formData.extracurricular_activities === "0"} onChange={handleChange} className="w-4 h-4 accent-purple-600" required />
                          <span className="text-sm">No</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── B: Science Scores ── */}
          {currentStep === 2 && (
            <div className="section">
              <div className="section-header">
                <div className="section-badge">B</div>
                <span className="uppercase tracking-[3px] font-semibold text-sm">Science Subjects (0-100)</span>
              </div>
              
              <div className="space-y-8">
                <p className="text-sm italic text-slate-600 max-w-2xl">
                  Enter your most recent examination scores below.
                </p>

                <div>
                  <div className="mb-6 px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl border-l-4 border-indigo-500">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Science Subjects</span>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {scienceSubjects.map((subject) => (
                      <div key={subject.name} className="p-6 bg-white/70 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                          {subject.label}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            name={subject.name}
                            value={formData[subject.name]}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            className="w-full bg-transparent border-b-2 border-slate-300 pb-3 text-2xl font-bold font-[Libre_Baskerville] text-slate-900 outline-none focus:border-indigo-500 placeholder-slate-400"
                            placeholder="—"
                            required
                          />
                          {formData[subject.name] && (
                            <div className="score-progress mt-3">
                              <div 
                                className="score-progress-fill"
                                style={{
                                  width: `${Math.min(100, Number(formData[subject.name]))}%`,
                                  backgroundColor: getScoreStrength(formData[subject.name]).color,
                                }}
                              />
                            </div>
                          )}
                        </div>
                        {formData[subject.name] && (
                          <div className="text-xs font-semibold mt-2 px-2 py-1 rounded-full inline-block bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700">
                            {getScoreStrength(formData[subject.name]).label}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── C: Humanities Scores ── */}
          {currentStep === 3 && (
            <div className="section">
              <div className="section-header">
                <div className="section-badge">C</div>
                <span className="uppercase tracking-[3px] font-semibold text-sm">Humanities Subjects (0-100)</span>
              </div>
              
              <div className="space-y-8">
                <p className="text-sm italic text-slate-600 max-w-2xl">
                  Enter your most recent examination scores below. Overall average: <strong>{avgScore ?? "—"}</strong>
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {humanitiesSubjects.map((subject, idx) => (
                    <div key={subject.name} className={`p-6 bg-white/70 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 ${idx === 2 ? 'lg:col-span-3 avg-score' : ''}`}>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                        {subject.label}
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          name={subject.name}
                          value={formData[subject.name]}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          className="w-full bg-transparent border-b-2 border-slate-300 pb-3 text-2xl font-bold font-[Libre_Baskerville] text-slate-900 outline-none focus:border-indigo-500 placeholder-slate-400"
                          placeholder="—"
                          required
                        />
                        {formData[subject.name] && (
                          <div className="score-progress mt-3">
                            <div 
                              className="score-progress-fill"
                              style={{
                                width: `${Math.min(100, Number(formData[subject.name]))}%`,
                                backgroundColor: getScoreStrength(formData[subject.name]).color,
                              }}
                            />
                          </div>
                        )}
                      </div>
                      {formData[subject.name] && (
                        <div className="text-xs font-semibold mt-2 px-2 py-1 rounded-full inline-block bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700">
                          {getScoreStrength(formData[subject.name]).label}
                        </div>
                      )}
                      
                      {idx === 2 && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-l-4 border-indigo-600">
                          <div className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-2">Overall Average</div>
                          <div className="text-3xl font-black font-[Libre_Baskerville] text-indigo-700">
                            {avgScore ?? "—"}
                          </div>
                          <div className="text-xs text-indigo-600 mt-1">out of 100</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation & Submit */}
          <div className="section pt-12">
            <div className="section-header">
              <div className="section-badge">{String.fromCharCode(64 + (currentStep === 3 ? 4 : totalSteps))}</div>
              <span className="uppercase tracking-[3px] font-semibold text-sm">
                {currentStep === 3 ? "Declaration & Submission" : "Navigation"}
              </span>
            </div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pt-8">
              <div className="text-sm text-slate-600 italic max-w-2xl leading-relaxed max-lg:order-3">
                I confirm the information provided is accurate. This AI prediction serves as guidance only and should be supplemented by professional career counseling.
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto max-lg:order-2">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex-1 px-8 py-4 text-lg font-semibold text-slate-700 bg-gradient-to-r from-slate-100 to-slate-200 border-2 border-slate-300 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-[Source_Sans_3]"
                  >
                    ← Previous Section
                  </button>
                )}
                
                {currentStep === totalSteps ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl shadow-2xl hover:shadow-3xl active:scale-[0.98] transition-all duration-200 font-[Source_Sans_3] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="btn-spinner inline-block mr-3" />
                        Analysing Profile…
                      </>
                    ) : (
                      "Submit & Predict Career"
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-2xl hover:shadow-3xl active:scale-[0.98] transition-all duration-200 font-[Source_Sans_3] uppercase tracking-wider"
                  >
                    Next Section →
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Result Section */}
        {result && (
          <div className="mt-16 pt-12 border-t-4 border-indigo-600 result-section animate-[resultSlide_0.6s_ease-out]">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 p-10 lg:p-12 rounded-3xl">
              <div className="flex justify-between items-center mb-8">
                <div className="px-4 py-2 bg-indigo-100 rounded-full text-indigo-800 font-bold text-sm uppercase tracking-wider">
                  ✦ Prediction Result
                </div>
                <button
                  onClick={() => {
                    setResult(null);
                    setFormData({
                      gender: "", part_time_job: "", extracurricular_activities: "",
                      weekly_self_study_hours: "", math_score: "", history_score: "",
                      physics_score: "", chemistry_score: "", biology_score: "",
                      english_score: "", geography_score: "",
                    });
                    setCurrentStep(1);
                  }}
                  className="px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded-xl hover:bg-slate-200 transition-all duration-200 font-[Source_Sans_3]"
                >
                  Reset Form
                </button>
              </div>
              
              <div className="text-5xl lg:text-6xl font-black font-[Libre_Baskerville] text-slate-900 mb-8 leading-tight">
                {result.career_prediction}
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-600">Model Confidence</span>
                <span className="text-2xl font-black text-indigo-700">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-8">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000"
                  style={{ width: `${(result.confidence * 100).toFixed(1)}%` }}
                />
              </div>
              
              <p className="text-sm text-slate-600 italic leading-relaxed font-[Libre_Baskerville]">
                This prediction is generated by machine learning analysis of your academic profile. Consult a career advisor for personalized guidance.
              </p>
            </div>
          </div>
        )}

        {/* Paper Footer */}
        <div className="mt-20 pt-8 border-t border-slate-300 text-center text-xs text-slate-500 uppercase tracking-wider font-[Source_Sans_3]">
          <div className="flex justify-between">
            <span>AI Career Predictor — Confidential Student Record</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
