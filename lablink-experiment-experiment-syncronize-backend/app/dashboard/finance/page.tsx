'use client';

import { useEffect, useState } from 'react';
import { api } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { FinanceTransaction, TransactionSummary } from '@/app/types';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Table from '@/app/components/ui/Table';
import { PageWrapper, AnimatedSection } from '@/app/components/ui/PageAnimation';
import { formatCurrency } from '../../lib/utils'; // Assuming utils exists, if not need to create or inline
import { Plus, Download, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

import CreateTransactionModal from './CreateTransactionModal';
import CreateDuesModal from './CreateDuesModal';
import CreateProcurementModal from './CreateProcurementModal';
import ProcurementList from './ProcurementList';
import DuesList from './DuesList';

export default function FinancePage() {
  const { user, isAdmin } = useAuth(); 
  
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'procurement' | 'dues'>('transactions');
  
  // Modals
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDuesModal, setShowDuesModal] = useState(false);
  const [showProcurementModal, setShowProcurementModal] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Parallel fetch summary and transactions
      const [summaryData, transactionsData] = await Promise.all([
        api.get<TransactionSummary>('/finance/transactions/summary'),
        // Fetch latest 10 transactions for dashboard view
        api.get<any>('/finance/transactions?page=0&size=10') 
      ]);
      
      setSummary(summaryData);
      setTransactions(transactionsData.content || []);
    } catch (err) {
      console.error('Failed to load finance data:', err);
      // Don't show critical error immediately, try to show what loaded
      // setError('Gagal memuat data keuangan');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { 
      key: 'transactionDate', 
      header: 'Tanggal',
      render: (item: FinanceTransaction) => new Date(item.transactionDate).toLocaleDateString('id-ID')
    },
    { 
      key: 'type', 
      header: 'Tipe',
      render: (item: FinanceTransaction) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.type === 'INCOME' 
            ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
            : 'bg-red-500/10 text-red-700 dark:text-red-400'
        }`}>
          {item.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
        </span>
      )
    },
    { key: 'categoryName', header: 'Kategori' },
    { key: 'description', header: 'Keterangan' },
    { 
      key: 'amount', 
      header: 'Jumlah',
      render: (item: FinanceTransaction) => (
        <span className={`font-medium ${
            item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
        }`}>
          {item.type === 'EXPENSE' ? '-' : '+'} {formatCurrency(item.amount)}
        </span>
      )
    },
    {
        key: 'actions',
        header: 'Bukti',
        render: (item: FinanceTransaction) => item.receiptUrl ? (
            <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">
                Lihat
            </a>
        ) : '-'
    }
  ];

  // ... inside FinancePage ...


  // ... state ...

  const canRecordTransaction = isAdmin || user?.role === 'TREASURER' || user?.role === 'HEAD_LAB';

  return (
    <PageWrapper className="space-y-6 pb-10">
      <AnimatedSection className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Keuangan</h1>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={fetchData}>Refresh</Button>
            
            {canRecordTransaction ? (
                <Button onClick={() => setShowTransactionModal(true)}>+ Catat Transaksi</Button>
            ) : (
                <>
                    <Button variant="secondary" onClick={() => setShowDuesModal(true)}>
                       Bayar Kas
                    </Button>
                    <Button variant="secondary" onClick={() => setShowProcurementModal(true)}>
                       + Ajukan Pengadaan
                    </Button>
                </>
            )}
        </div>
      </AnimatedSection>

      {/* Modals */}
      {showTransactionModal && (
        <CreateTransactionModal 
          onClose={() => setShowTransactionModal(false)} 
          onSuccess={fetchData} 
        />
      )}
      {showDuesModal && (
        <CreateDuesModal 
          isOpen={showDuesModal}
          onClose={() => setShowDuesModal(false)} 
          onSuccess={() => {/* Success toast handled in modal */}} 
        />
      )}
      {showProcurementModal && (
        <CreateProcurementModal 
          isOpen={showProcurementModal}
          onClose={() => setShowProcurementModal(false)} 
          onSuccess={() => {/* Success toast handled in modal */}} 
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedSection>
            <Card className="p-6 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Saldo Akhir</p>
                        <h3 className="text-2xl font-bold text-blue-600">
                            {summary ? formatCurrency(summary.balance) : 'Rp 0'}
                        </h3>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <Wallet className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
            </Card>
        </AnimatedSection>

        <AnimatedSection>
            <Card className="p-6 border-l-4 border-l-green-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Pemasukan</p>
                        <h3 className="text-2xl font-bold text-green-600">
                            {summary ? formatCurrency(summary.totalIncome) : 'Rp 0'}
                        </h3>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                </div>
            </Card>
        </AnimatedSection>

        <AnimatedSection>
            <Card className="p-6 border-l-4 border-l-red-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Pengeluaran</p>
                        <h3 className="text-2xl font-bold text-red-600">
                            {summary ? formatCurrency(summary.totalExpense) : 'Rp 0'}
                        </h3>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl">
                        <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                </div>
            </Card>
        </AnimatedSection>
      </div>

      <AnimatedSection>
         {/* TAB NAVIGATION */}
         <div className="flex items-center gap-2 border-b border-border mb-6">
             <button 
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'transactions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
             >
                Riwayat Transaksi
             </button>
             <button 
                onClick={() => setActiveTab('procurement')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'procurement' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
             >
                Pengajuan Pengadaan
             </button>
             <button 
                onClick={() => setActiveTab('dues')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'dues' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
             >
                Verifikasi Kas
             </button>
         </div>

         {activeTab === 'transactions' && (
             <Card>
                 <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-semibold">Transaksi Terakhir</h2>
                     <Button variant="ghost" size="sm">Lihat Semua</Button>
                 </div>
                 
                 <Table 
                     columns={columns}
                     data={transactions}
                     keyField="id"
                     isLoading={isLoading}
                     emptyMessage="Belum ada transaksi"
                 />
             </Card>
         )}
         
         {activeTab === 'procurement' && (
             <Card>
                 <ProcurementList />
             </Card>
         )}

         {activeTab === 'dues' && (
             <Card>
                 <DuesList />
             </Card>
         )}
      </AnimatedSection>
    </PageWrapper>
  );
}
