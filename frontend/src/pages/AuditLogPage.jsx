import React, { useEffect, useState } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import { FileText, ArrowRight } from 'lucide-react';

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/audit-logs')
            .then(res => res.json())
            .then(data => {
                setLogs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch logs', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader title="System Audit Logs" userRole="Public / Auditor" />

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Immutable Activity Log
                        </h2>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Read Only</span>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading logs...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-3 font-medium">Timestamp</th>
                                        <th className="px-6 py-3 font-medium">Action</th>
                                        <th className="px-6 py-3 font-medium">User Role</th>
                                        <th className="px-6 py-3 font-medium">Reference ID</th>
                                        <th className="px-6 py-3 font-medium">Result / Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {logs.length > 0 ? (
                                        logs.map((log) => (
                                            <tr key={log._id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.actionType === 'UPLOAD' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                        }`}>
                                                        {log.actionType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{log.userRole}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500 max-w-[150px] truncate" title={log.referenceId}>
                                                    {log.referenceId || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {log.verificationResult && (
                                                        <span className={`font-semibold mr-2 ${log.verificationResult === 'VERIFIED' ? 'text-green-600' :
                                                                log.verificationResult === 'NOT_FOUND' ? 'text-red-600' : 'text-gray-800'
                                                            }`}>
                                                            {log.verificationResult}
                                                        </span>
                                                    )}
                                                    <span className="text-gray-400 text-xs">{log.details}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                                No activity recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AuditLogPage;
