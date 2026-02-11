import React, { useState } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import { Upload, CheckCircle, FileVideo, AlertCircle, XCircle } from 'lucide-react';
import axiosInstance from '../helper/axiosInstance';

const OfficialDashboard = () => {
    const [formData, setFormData] = useState({
        title: '',
        authority: 'Ministry of Information & Broadcasting',
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('authority', formData.authority);

        if (!formData.useLink && file) {
            data.append('videoFile', file);
        } else if (formData.useLink && formData.link) {
            data.append('link', formData.link);
        }

        try {
            const response = await axiosInstance.post('/api/videos/upload', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResult(response.data.data); // Axios puts the actual response data in .data
            setFile(null); // Reset file input
            setFormData(prev => ({ ...prev, title: '', link: '', useLink: false })); // Reset form
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + (error.response?.data?.message || 'Server Error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader title="Official Registry Upload" userRole="Official Authority" />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center space-x-3">
                        <Upload className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-800">Register New Official Video</h2>
                    </div>

                    <div className="p-8">
                        {!result ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Video Title / Subject</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="e.g. Press Briefing on Economic Policy - Oct 2023"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                                        <select
                                            className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                            value={formData.authority}
                                            onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                                        >
                                            <option>Ministry of Information & Broadcasting</option>
                                            <option>Prime Minister's Office</option>
                                            <option>Ministry of Health</option>
                                            <option>Ministry of External Affairs</option>
                                        </select>
                                    </div>

                                    <div>
                                        <div className="flex space-x-4 mb-4">
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
                                                Import via Link
                                            </button>
                                        </div>

                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {formData.useLink ? 'Media Link (URL)' : 'Upload Official File (Video, Image, PDF)'}
                                        </label>

                                        {formData.useLink ? (
                                            <div className="space-y-4">
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                    placeholder="https://example.com/video.mp4"
                                                    value={formData.link || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                                />
                                                {formData.link && (
                                                    <div className="w-full relative rounded-lg overflow-hidden bg-black/5 border border-gray-200" style={{ maxHeight: '300px' }}>
                                                        {formData.link.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                                            <img src={formData.link} alt="Preview" className="mx-auto max-h-[300px] object-contain" onError={(e) => e.target.style.display = 'none'} />
                                                        ) : (
                                                            <video src={formData.link} controls className="mx-auto max-h-[300px] w-full" onError={(e) => e.target.style.display = 'none'} />
                                                        )}
                                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                            URL Preview
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                                {!file ? (
                                                    <>
                                                        <input
                                                            type="file"
                                                            accept="video/*,image/*,application/pdf"
                                                            onChange={(e) => setFile(e.target.files[0])}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-gray-600 font-medium">Click to upload file</p>
                                                            <p className="text-xs text-gray-500">MP4, MOV, JPG, PNG, PDF allowed</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full relative pointer-events-auto z-10">
                                                        <div className="mb-4 relative rounded-lg overflow-hidden bg-black/5 border border-gray-200" style={{ maxHeight: '300px' }}>
                                                            {file.type.startsWith('image/') ? (
                                                                <img src={URL.createObjectURL(file)} alt="Preview" className="mx-auto max-h-[300px] object-contain" />
                                                            ) : file.type.startsWith('video/') ? (
                                                                <video src={URL.createObjectURL(file)} controls className="mx-auto max-h-[300px] w-full" />
                                                            ) : file.type === 'application/pdf' ? (
                                                                <iframe src={URL.createObjectURL(file)} title="PDF Preview" className="w-full h-[300px]" />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-[200px] text-gray-500">
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
                                                        <p className="text-sm text-green-600 font-medium mt-2">{file.name}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {loading ? 'Registering...' : 'Register Official Video'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Official Video Registered Successfully</h3>
                                <p className="text-gray-500 mb-6">The video metadata and hash have been securely stored in the registry.</p>

                                <div className="bg-gray-50 rounded-lg p-6 max-w-lg mx-auto text-left border border-gray-200">
                                    <div className="mb-3">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Verification ID</span>
                                        <p className="text-sm font-mono text-gray-800 break-all">{result.verificationId}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cryptographic Hash</span>
                                        <p className="text-xs font-mono text-gray-600 break-all">{result.hash}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setResult(null); setFile(null); setFormData(prev => ({ ...prev, title: '', link: '', useLink: false })); }}
                                    className="mt-8 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Register Another Video
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main >
        </div >
    );
};

export default OfficialDashboard;
