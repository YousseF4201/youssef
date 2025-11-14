
import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';

const QRIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h2v2H4zM4 10h2v2H4zM4 16h2v2H4zM10 4h2v2h-2zM10 10h2v2h-2zM10 16h2v2h-2zM16 4h2v2h-2zM16 10h2v2h-2zM16 16h2v2h-2z" />
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <rect x="3" y="15" width="6" height="6" rx="1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h2v2h-2zM10 12h.01M12 10h.01M14 12h.01M12 14h.01" />
  </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
);


export default function App() {
    const [text, setText] = useState<string>('صلي علي سيدنا محمد');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
    const [canShare, setCanShare] = useState<boolean>(false);

    useEffect(() => {
        if (navigator.share) {
            setCanShare(true);
        }
    }, []);

    useEffect(() => {
        if (text.trim() === '') {
            setQrCodeDataUrl('');
            return;
        }

        const generateQrCode = async () => {
            try {
                const url = await QRCode.toDataURL(text, {
                    errorCorrectionLevel: 'H',
                    type: 'image/png',
                    margin: 1,
                    width: 300,
                    color: {
                        dark: '#0f172a', // slate-900
                        light: '#ffffff'
                    }
                });
                setQrCodeDataUrl(url);
            } catch (err) {
                console.error('Failed to generate QR code', err);
                setQrCodeDataUrl('');
            }
        };

        generateQrCode();
    }, [text]);

    const handleDownload = useCallback(() => {
        if (!qrCodeDataUrl) return;

        const link = document.createElement('a');
        link.href = qrCodeDataUrl;
        link.download = 'qrcode.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [qrCodeDataUrl]);

    const handleShare = useCallback(async () => {
        if (!qrCodeDataUrl || !canShare) return;
        try {
            const response = await fetch(qrCodeDataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'qrcode.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'رمز الاستجابة السريعة',
                    text: `رمز QR لـ: ${text}`,
                });
            } else {
                alert("المشاركة غير مدعومة لهذا النوع من الملفات.");
            }
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('حدث خطأ أثناء المشاركة:', error);
                alert(`حدث خطأ أثناء المشاركة: ${(error as Error).message}`);
            }
        }
    }, [qrCodeDataUrl, text, canShare]);

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 transform transition-all duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white flex items-center justify-center">
                        QuickQR
                        <QRIcon />
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        أدخل نصًا أو رابطًا لإنشاء رمز QR الخاص بك فورًا.
                    </p>
                </div>

                <div className="mb-6">
                    <label htmlFor="qr-text" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        النص أو الرابط
                    </label>
                    <textarea
                        id="qr-text"
                        rows={4}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-slate-800 dark:text-slate-200"
                        placeholder="اكتب هنا..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>

                <div className="flex flex-col items-center justify-center space-y-4">
                    {qrCodeDataUrl ? (
                        <div className="p-4 bg-white rounded-lg border border-slate-200 dark:border-slate-600 shadow-inner">
                             <img src={qrCodeDataUrl} alt="Generated QR Code" className="w-48 h-48 md:w-56 md:h-56 rounded-md" />
                        </div>
                    ) : (
                        <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                           <p className="text-slate-400 dark:text-slate-500 text-center text-sm p-4">سيظهر رمز QR هنا</p>
                        </div>
                    )}
                    
                    <div className="w-full flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleDownload}
                            disabled={!qrCodeDataUrl}
                            className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
                        >
                            تحميل كـ PNG
                            <DownloadIcon />
                        </button>
                        {canShare && (
                          <button
                              onClick={handleShare}
                              disabled={!qrCodeDataUrl}
                              className="w-full flex items-center justify-center bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
                          >
                              مشاركة
                              <ShareIcon />
                          </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}