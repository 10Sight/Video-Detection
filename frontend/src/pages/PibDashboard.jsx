import React, { useState } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Upload, AlertTriangle, XCircle, FileVideo } from 'lucide-react';

const PibDashboard = () => {
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'id'
    const [verificationId, setVerificationId] = useState('');
    const [formData, setFormData] = useState({
        useLink: false,
        link: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setVerificationResult(null);

        const data = new FormData();
        if (activeTab === 'id') {
            data.append('verificationId', verificationId);
        } else {
            if (!formData.useLink && !file) return alert('Please select a file to verify');
            if (formData.useLink && !formData.link) return alert('Please enter a link to verify');

            if (!formData.useLink && file) {
                data.append('videoFile', file);
            } else if (formData.useLink && formData.link) {
                data.append('link', formData.link);
            }
        }

        try {
            const response = await axiosInstance.post('/api/videos/verify', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setVerificationResult(response.data);
        } catch (error) {
            console.error('Verify error:', error);
            alert('Verification service unreachable: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader title="Fact Check Workbench" userRole="PIB Fact Check" />

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Verification Input Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <Search className="w-5 h-5 mr-2 text-blue-600" />
                                Verify Circulating Content
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                                <button
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${activeTab === 'upload' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => { setActiveTab('upload'); setVerificationResult(null); setFile(null); setFormData({ useLink: false, link: '' }); }}
                                >
                                    Check by File
                                </button>
                                <button
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${activeTab === 'id' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => { setActiveTab('id'); setVerificationResult(null); }}
                                >
                                    Check by ID
                                </button>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-6">
                                {activeTab === 'upload' ? (
                                    <div className="space-y-4">
                                        <div className="flex space-x-4 mb-2">
                                            <button
                                                type="button"
                                                className={`flex-1 py-2 text-sm font-medium rounded-md border text-center transition ${!formData.useLink ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                                onClick={() => setFormData(prev => ({ ...prev, useLink: false }))}
                                            >
                                                Upload from Device
                                            </button>
                                            <button
                                                type="button"
                                                className={`flex-1 py-2 text-sm font-medium rounded-md border text-center transition ${formData.useLink ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                                onClick={() => setFormData(prev => ({ ...prev, useLink: true }))}
                                            >
                                                Check via Link
                                            </button>
                                        </div>

                                        {formData.useLink ? (
                                            <div>
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm mb-4"
                                                    placeholder="https://example.com/viral-video.mp4"
                                                    value={formData.link || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                                />
                                                {formData.link && (
                                                    <div className="w-full relative rounded-lg overflow-hidden bg-black/5 border border-gray-200" style={{ maxHeight: '200px' }}>
                                                        {formData.link.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                                            <img src={formData.link} alt="Preview" className="mx-auto max-h-[200px] object-contain" onError={(e) => e.target.style.display = 'none'} />
                                                        ) : (
                                                            <video src={formData.link} controls className="mx-auto max-h-[200px] w-full" onError={(e) => e.target.style.display = 'none'} />
                                                        )}
                                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                            URL Preview
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition min-h-[200px] flex flex-col justify-center relative">
                                                {!file ? (
                                                    <>
                                                        <FileVideo className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                        <label className="cursor-pointer">
                                                            <span className="text-blue-600 font-medium hover:underline">Click to upload mock viral file</span>
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                onChange={(e) => setFile(e.target.files[0])}
                                                                accept="video/*,image/*,application/pdf"
                                                            />
                                                        </label>
                                                        <p className="text-xs text-gray-400 mt-2">Simulate checking content found on social media (Video/Image/PDF)</p>
                                                    </>
                                                ) : (
                                                    <div className="w-full relative pointer-events-auto z-10 space-y-2">
                                                        <div className="mb-2 relative rounded-lg overflow-hidden bg-black/5 border border-gray-200" style={{ maxHeight: '200px' }}>
                                                            {file.type.startsWith('image/') ? (
                                                                <img src={URL.createObjectURL(file)} alt="Preview" className="mx-auto max-h-[200px] object-contain" />
                                                            ) : file.type.startsWith('video/') ? (
                                                                <video src={URL.createObjectURL(file)} controls className="mx-auto max-h-[200px] w-full" />
                                                            ) : file.type === 'application/pdf' ? (
                                                                <iframe src={URL.createObjectURL(file)} title="PDF Preview" className="w-full h-[200px]" />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-[150px] text-gray-500">
                                                                    No Preview Available
                                                                </div>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.preventDefault(); setFile(null); }}
                                                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-sm z-20"
                                                                title="Remove file"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <p className="text-sm font-semibold bg-blue-50 text-blue-800 py-1 px-3 rounded-full inline-block truncate max-w-full">{file.name}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Verification ID</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                            placeholder="e.g. 123e4567-e89b-..."
                                            value={verificationId}
                                            onChange={(e) => setVerificationId(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-400 mt-2">Enter the ID displayed on the video watermark or description.</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                    ) : (
                                        <ShieldCheck className="w-5 h-5 mr-2" />
                                    )}
                                    {loading ? 'Analyzing Registry...' : (formData.useLink ? 'Verify Link' : 'Run Verification')}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Verification Result Section */}
                    <div className="flex flex-col">
                        {verificationResult ? (
                            <div className={`bg-white rounded-xl shadow-lg border-t-8 h-full flex flex-col ${verificationResult.status === 'VERIFIED' ? 'border-green-500' :
                                verificationResult.status === 'NOT_FOUND' ? 'border-red-500' : 'border-orange-500'
                                }`}>
                                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">

                                    {verificationResult.status === 'VERIFIED' && (
                                        <>
                                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                                <ShieldCheck className="w-10 h-10 text-green-600" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified Official</h2>
                                            <p className="text-gray-600 mb-8 max-w-xs">This video content matches an official record in the government registry.</p>

                                            <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 text-left space-y-3">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Official Title</span>
                                                    <p className="text-gray-900 font-medium">{verificationResult.data.title}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Issuing Authority</span>
                                                    <p className="text-gray-900">{verificationResult.data.authority}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Registered Date</span>
                                                    <p className="text-gray-900">{new Date(verificationResult.data.timestamp).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Verification ID</span>
                                                    <p className="font-mono text-xs text-gray-500">{verificationResult.data.verificationId}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {verificationResult.status === 'NOT_FOUND' && (
                                        <>
                                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                                <XCircle className="w-10 h-10 text-red-600" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Official Record Found</h2>
                                            <div className="flex items-center justify-center space-x-2 mb-8">
                                                <p className="text-gray-600">This video does not exist in the official registry.</p>
                                                <div className="relative group">
                                                    <AlertTriangle className="w-4 h-4 text-gray-400 cursor-help" />
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                                                        Absence of a record indicates the content is not officially registered. It does not imply illegality, misinformation, or intent.
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="w-full bg-red-50 text-red-800 p-4 rounded-lg text-sm border border-red-100">
                                                <strong>Warning:</strong> No metadata or hash match was found.
                                            </div>
                                        </>
                                    )}

                                    {verificationResult.status === 'MODIFIED' && (
                                        <>
                                            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                                                <AlertTriangle className="w-10 h-10 text-orange-600" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Modified / Partial Clip</h2>
                                            <p className="text-gray-600 mb-8 max-w-xs">This content appears to be derived from an official source but may be edited or incomplete.</p>
                                        </>
                                    )}

                                </div>
                                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                                    {verificationResult.status === 'VERIFIED' && (
                                        <Link to={`/verification/${verificationResult.data.verificationId}`} className="block w-full py-2 bg-blue-600 text-white rounded font-medium mb-3 hover:bg-blue-700 transition">
                                            View Verification Record
                                        </Link>
                                    )}
                                    <p className="text-xs text-gray-400">
                                        Disclaimer: This system verifies official issuance only and does not assess content accuracy.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center p-8 text-center opacity-70">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Ready to Verify</h3>
                                <p className="text-sm text-gray-500 max-w-xs mt-2">
                                    Upload a video or enter an ID to check its official status against the registry.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default PibDashboard;
