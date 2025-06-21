// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import { Html5QrcodeScanner } from 'html5-qrcode';
// import { useNavigate } from 'react-router';

// const QrScanner = () => {
//     const [error, setError] = useState('');
//     const router = useNavigate();
//     const scannerRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (!scannerRef.current) return;

//         const scanner = new Html5QrcodeScanner(
//             'qr-reader',
//             {
//                 fps: 10,
//                 qrbox: { width: 250, height: 250 },
//             },
//             false
//         );

//         scanner.render(
//             (decodedText: any) => {
//                 console.log("Scanned QR: ", decodedText);
//                 scanner.clear().then(() => {
//                     // Example: if QR = https://shrimaya.com/menu/table-5 → redirect
//                     if (decodedText.startsWith("http")) {
//                         window.location.href = decodedText;
//                     } else {
//                         router(`/menu/${decodedText}`); // open local menu
//                     }
//                 });
//             },
//             (err) => {
//                 console.warn("Scan error:", err);
//                 setError("Could not detect QR. Try again.");
//             }
//         );

//         return () => {
//             scanner.clear().catch((err) => console.error("Clear error:", err));
//         };
//     }, []);

//     return (
//         <div className="p-6 max-w-xl mx-auto text-center space-y-4">
//             <h2 className="text-2xl font-semibold">Scan QR Code to View Menu</h2>
//             <div id="qr-reader" ref={scannerRef} className="w-full border rounded-md" />
//             {error && <p className="text-red-500 text-sm">{error}</p>}
//         </div>
//     );
// };

// export default QrScanner;

import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { useNavigate } from "react-router-dom";

export default function QRScanner() {
  const navigate = useNavigate();

  const handleSimulatedScan = (tableId: number) => {
    navigate(`/categories/${tableId}`);
  };

  return (
    <>
      <PageMeta
        title="QR Scanner | Restaurant Dashboard"
        description="Simulate QR code scanning and navigate to table-specific menus"
      />
      <PageBreadcrumb pageTitle="QR Scanner" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          Simulated QR Scan
        </h3>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          Select a table to simulate QR code scanning:
        </p>

        <div className="flex flex-wrap gap-4">
          {[1, 2, 3].map((id) => (
            <button
              key={id}
              onClick={() => handleSimulatedScan(id)}
              className="rounded-xl bg-primary px-6 py-3 text-black shadow-md hover:bg-primary-dark transition-all"
            >
              Simulate Table {id}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
