import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SwitchSP from '../components/SwitchSP';
import { CheckCircle } from 'lucide-react';

interface Project {
    id: string;
    description: string;
    quotes: any[];
}

const QuoteReview: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            const data = await res.json();
            if (res.ok) {
                setProject(data);
                calculateTotal(data.quotes);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to fetch project');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (quotes: any[]) => {
        const total = quotes.reduce((sum, q) => q.isSelected ? sum + q.amount : sum, 0);
        setTotalCost(total);
    };

    const handleSwitch = async (trade: string, quoteId: string) => {
        if (!project) return;

        // Optimistic update
        const updatedQuotes = project.quotes.map(q => {
            const quoteTrade = q.trade || 'General';
            if (quoteTrade === trade) {
                return { ...q, isSelected: q.id === quoteId };
            }
            return q;
        });

        setProject({ ...project, quotes: updatedQuotes });
        calculateTotal(updatedQuotes);

        // API Call
        try {
            await fetch(`/api/projects/${id}/select-quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId })
            });
        } catch (err) {
            console.error('Failed to update quote selection', err);
            // Revert? For now, we assume success or user can retry
        }
    };

    const handleFinalize = async () => {
        if (!project) return;
        try {
            const res = await fetch(`/api/projects/${id}/finalize`, {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok) {
                alert('Master Quote Sent!');
                navigate('/');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            console.error('Finalize error', err);
            alert('Failed to finalize project');
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading project details...</div>;
    if (error) return <div className="p-12 text-center text-red-500">Error: {error}</div>;
    if (!project) return <div className="p-12 text-center text-gray-500">Project not found</div>;

    // Group quotes by trade
    const quotesByTrade: Record<string, any[]> = {};
    if (project.quotes) {
        project.quotes.forEach(q => {
            const trade = q.trade || 'General';
            if (!quotesByTrade[trade]) quotesByTrade[trade] = [];
            quotesByTrade[trade].push(q);
        });
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-black text-gray-900 mb-8">Review Your Quotes</h1>

            <div className="grid gap-8 mb-10">
                {Object.entries(quotesByTrade).map(([trade, quotes]) => (
                    <SwitchSP
                        key={trade}
                        trade={trade}
                        providers={quotes.map(q => ({
                            id: q.id, // SwitchSP expects ID to pass to onSwitch. We pass quote ID here.
                            name: q.serviceProvider.name,
                            rating: q.serviceProvider.rating,
                            isSelected: q.isSelected
                        }))}
                        onSwitch={(quoteId) => handleSwitch(trade, quoteId)}
                    />
                ))}
            </div>

            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl flex items-center justify-between sticky bottom-6">
                <div>
                    <p className="text-gray-400 text-sm uppercase tracking-wider font-bold mb-1">Grand Total</p>
                    <p className="text-4xl font-black">R {totalCost.toLocaleString()}</p>
                </div>
                <button
                    onClick={handleFinalize}
                    className="bg-primary-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-600 transition-all flex items-center gap-2"
                >
                    Finalize & Send <CheckCircle className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default QuoteReview;
