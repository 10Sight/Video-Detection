import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import { ShieldCheck, Calendar, Building, Hash, Info, ChevronLeft, FileVideo } from 'lucide-react';
import axiosInstance from '../helper/axiosInstance';

const VerificationRecord = () => {
    const { id } = useParams();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // We reuse the verify endpoint by passing ID to get details
        // Or we could create a specific GET endpoint. 
        // For now, let's use the verify POST endpoint as a quick lookup since we have it.
        const fetchRecord = async () => {
            try {
                const data = new FormData();
                data.append('verificationId', id);

                const response = await axiosInstance.post('/api/videos/verify', data);
                const resData = response.data;

                if (resData.status === 'VERIFIED') {
                    setRecord(resData.data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchRecord();
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader title="Official Verification Record" userRole="Public Record View" />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <Link to="/dashboard/pib" className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Verification Tool
                </Link>

                {loading ? (
                    <div className="text-center py-12">Loading record...</div>
                ) : error || !record ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center text-red-800">
                        <h2 className="text-xl font-bold mb-2">Record Not Found</h2>
                        <p>The verification ID provided does not match any official record.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg border-t-8 border-green-500 overflow-hidden">
                        <div className="p-8 text-center border-b border-gray-100">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-12 h-12 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Official Record Confirmed</h1>
                            <p className="text-gray-500">This content has been issued by a recognized authority.</p>
                        </div>

                        <div className="p-8 bg-gray-50">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Record Details</h3>
                            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <Building className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Issuing Authority</p>
                                        <p className="text-lg font-bold text-gray-900">{record.authority}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <FileVideo className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Content Title</p>
                                        <p className="text-lg text-gray-900">{record.title}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <Calendar className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Registration Date</p>
                                        <p className="text-gray-900">{new Date(record.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <Hash className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div className="ml-4 w-full">
                                        <p className="text-sm font-medium text-gray-500">Verification ID</p>
                                        <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1 break-all select-all">{record.verificationId}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-start p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mr-3" />
                                <p className="text-sm text-blue-900">
                                    <strong>Disclaimer:</strong> This record confirms official issuance only and does not assess content accuracy. The existence of this record verifies that the metadata matches the official registry.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VerificationRecord;
