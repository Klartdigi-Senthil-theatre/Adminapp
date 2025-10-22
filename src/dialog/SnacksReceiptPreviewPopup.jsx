import { Printer, X } from "lucide-react";
import { useMemo, useState } from "react";

const SnacksReceiptPreviewPopup = ({
    cartItems = [],
    currentShow,
    orderId,
    paymentMode,
    onClose,
}) => {
    const [isPrinting, setIsPrinting] = useState(false);

    const grouped = useMemo(() => {
        const byCat = cartItems.reduce((acc, item) => {
            const key = item.category || "Others";
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
        const categories = Object.keys(byCat);
        const totals = categories.reduce(
            (agg, cat) => {
                const catTotal = byCat[cat].reduce(
                    (sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 0)),
                    0
                );
                const catQty = byCat[cat].reduce((sum, it) => sum + Number(it.quantity || 0), 0);
                agg.amount += catTotal;
                agg.count += catQty;
                return agg;
            },
            { amount: 0, count: 0 }
        );
        return { byCat, categories, totals };
    }, [cartItems]);

    const receiptNo = useMemo(() => `REC-${String(orderId || Date.now()).slice(-6)}`, [orderId]);
    const now = new Date();
    const nowDate = now.toLocaleDateString("en-GB");
    const nowTime = now.toLocaleTimeString();
    const showTime = currentShow?.time || "--";
    const showDate = currentShow?.date || now.toISOString().split("T")[0];
    const payment = paymentMode === "gpay" ? "Gpay" : paymentMode === "online" ? "Online" : "Cash";

    const handlePrint = () => {
        // Block printing for past dates
        try {
            const selected = currentShow?.date ? new Date(currentShow.date) : null;
            if (selected) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selected.setHours(0, 0, 0, 0);
                if (selected < today) {
                    alert("Cannot print for a past date. Please select today or a future date.");
                    return;
                }
            }
        } catch (_) { }
        setIsPrinting(true);
        const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Snacks Receipt</title>
          <style>
            * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; margin: 0; padding: 0; box-sizing: border-box; }
            @page { size: 80mm auto; margin: 0; }
            body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.2; margin: 0; padding: 2mm; width: 100%; max-width: 100vw; color: #000; background: #fff; }
            .ticket { width: 100%; page-break-inside: avoid; break-inside: avoid; page-break-after: always; margin-bottom: 0; }
            .ticket:last-child { page-break-after: auto; }
            .header { background: #000 !important; color: #fff !important; text-align: center; padding: 3mm 0; }
            .cinema { font-size: 14px; font-weight: bold; }
            .subtitle { font-size: 12px; }
            .row { display: flex; justify-content: space-between; margin: 1.5mm 0; }
            .label { font-weight: bold; }
            .dotted { border-top: 1px dotted #000; margin: 2mm 0; }
            .section-title { color: #000 !important; font-size: 13px; font-weight: bold; margin: 2mm 0 1mm; text-align: center; }
            .section-line { border-top: 2px solid #000 !important; margin: 1mm 0; }
            .item { margin: 1.5mm 0; }
            .item-head { display: flex; justify-content: space-between; font-weight: bold; }
            .item-sub { display: flex; justify-content: space-between; font-size: 10px; }
            .large-text { font-size: 1.4rem !important; font-weight: bold; line-height: 1.2; }
            .item-total { text-align: right; color: #000 !important; font-size: 12px; font-weight: bold; }
            .totals { margin-top: 3mm; }
            .center { text-align: center; }
            .foot { text-align: center; font-size: 10px; margin-top: 3mm; }
            @media print { .large-text { font-size: 1.4rem !important; } }
          </style>
        </head>
        <body>
          ${grouped.categories
                .map((cat) => {
                    const items = grouped.byCat[cat];
                    const catTotal = items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
                    const catQty = items.reduce((s, it) => s + Number(it.quantity || 0), 0);
                    return `
                <div class="ticket">
                  <div class="header">
                    <div class="cinema">SENTHIL CINEMAS A/C</div>
                    <div class="subtitle">SNACKS ORDER</div>
                  </div>
                  <div class="dotted"></div>
                  <div class="row"><span class="label">Receipt No:</span><span>${receiptNo}</span></div>
                  <div class="row"><span class="label large-text">Date:</span><span class="large-text">${nowDate}</span></div>
                  <div class="row"><span class="label large-text">Time:</span><span class="large-text">${nowTime}</span></div>
                  <div class="row"><span class="label large-text">Show Time:</span><span class="large-text">${showTime}</span></div>
                  <div class="row"><span class="label">Payment:</span><span>${payment}</span></div>
                  <div class="dotted"></div>
                  <div class="section-title">${cat.toUpperCase()}</div>
                  <div class="section-line"></div>
                  ${items
                            .map((it) => {
                                const lineTotal = Number(it.price || 0) * Number(it.quantity || 0);
                                return `
                        <div class="item">
                          <div class="item-head"><span>${it.name || "Item"}</span><span>₹${Number(lineTotal).toLocaleString("en-IN")}</span></div>
                          <div class="item-sub"><span>Qty: ${it.quantity || 0}</span><span>₹${Number(it.price || 0).toLocaleString("en-IN")} × ${it.quantity || 0}</span></div>
                        </div>
                      `;
                            })
                            .join("")}
                  <div class="dotted"></div>
                  <div class="row"><span class="label">Total:</span><span>₹${catTotal.toLocaleString("en-IN")}</span></div>
                  <div class="row"><span class="label">Items:</span><span>${catQty}</span></div>
                  <div class="dotted"></div>
                  <div class="foot">
                    <div>GST: 33CMMPP7822B1Z2</div>
                    <div>Premium Cinema Experience</div>
                    <div class="label">Thank You!</div>
                    <div class="center" style="font-size: 9px; margin-top: 1mm;">மது அருந்தியவர்களுக்கு அனுமதி இல்லை. 3 வயது மற்றும் அதற்கு மேற்பட்டவர்களுக்கு டிக்கெட் கட்டாயம்.</div>
                  </div>
                </div>
              `;
                })
                .join("")}

          <div class="ticket">
            <div class="header">
              <div class="cinema">SENTHIL CINEMAS A/C</div>
              <div class="subtitle">ORDER SUMMARY</div>
            </div>
            <div class="dotted"></div>
            <div class="row"><span class="label">Receipt No:</span><span>${receiptNo}</span></div>
            <div class="row"><span class="label large-text">Date:</span><span class="large-text">${nowDate}</span></div>
            <div class="row"><span class="label large-text">Time:</span><span class="large-text">${nowTime}</span></div>
            <div class="row"><span class="label large-text">Show Time:</span><span class="large-text">${showTime}</span></div>
            <div class="dotted"></div>
            <div class="section-title">ORDER BREAKDOWN</div>
            <div class="section-line"></div>
            ${grouped.categories
                .map((cat) => {
                    const items = grouped.byCat[cat];
                    const catTotal = items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
                    const catQty = items.reduce((s, it) => s + Number(it.quantity || 0), 0);
                    return `<div class="row"><span>${cat}</span><span>${catQty} items</span></div><div class="row" style="justify-content:flex-end;"><span>₹${catTotal.toLocaleString('en-IN')}</span></div>`;
                })
                .join("")}
            <div class="dotted" style="border-top:2px solid #000; margin-top:3mm"></div>
            <div class="row"><span class="label">Total Items:</span><span>${grouped.totals.count}</span></div>
            <div class="row" style="color:#000; font-weight:bold"><span class="label">GRAND TOTAL:</span><span>₹${grouped.totals.amount.toLocaleString('en-IN')}</span></div>
            <div class="dotted"></div>
            <div class="foot">
              <div>GST: 33CMMPP7822B1Z2</div>
              <div>Premium Cinema Experience</div>
              <div class="label">Thank You!</div>
              <div class="center" style="font-size: 9px; margin-top: 1mm;">மது அருந்தியவர்களுக்கு அனுமதி இல்லை. 3 வயது மற்றும் அதற்கு மேற்பட்டவர்களுக்கு டிக்கெட் கட்டாயம்.</div>
            </div>
          </div>
        </body>
      </html>
    `;

        const w = window.open("", "_blank");
        w.document.write(printHtml);
        w.document.close();
        w.focus();
        w.print();
        w.close();
        setIsPrinting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-3 border-b">
                    <h3 className="text-lg font-bold">Snacks Receipt Preview</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 flex flex-wrap gap-4 justify-center">
                    {grouped.categories.map((cat) => {
                        const items = grouped.byCat[cat];
                        const catTotal = items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
                        const catQty = items.reduce((s, it) => s + Number(it.quantity || 0), 0);
                        return (
                            <div key={cat} className="bg-white rounded border-2 border-gray-300" style={{ width: "280px", maxWidth: "280px" }}>
                                <div className="bg-black text-white text-center py-2 px-3">
                                    <div className="text-sm font-bold mb-1">SENTHIL CINEMAS A/C</div>
                                    <div className="text-xs font-semibold">SNACKS ORDER</div>
                                </div>
                                <div className="p-3 text-xs space-y-1">
                                    <div className="flex justify-between"><span className="font-semibold">Receipt No:</span><span>{receiptNo}</span></div>
                                    <div className="flex justify-between items-center"><span className="font-semibold text-lg">Date:</span><span className="font-bold text-lg">{nowDate}</span></div>
                                    <div className="flex justify-between items-center"><span className="font-semibold text-lg">Time:</span><span className="font-bold text-lg">{nowTime}</span></div>
                                    <div className="flex justify-between items-center"><span className="font-semibold text-lg">Show Time:</span><span className="font-bold text-lg">{showTime}</span></div>
                                    <div className="flex justify-between"><span className="font-semibold">Payment:</span><span>{payment}</span></div>
                                    <div className="border-t border-dashed border-gray-400 my-2"></div>
                                    <div className="text-black font-bold text-xs text-center">{cat.toUpperCase()}</div>
                                    <div className="border-t-2 border-black my-1"></div>
                                    {items.map((it, idx) => {
                                        const lineTotal = Number(it.price || 0) * Number(it.quantity || 0);
                                        return (
                                            <div key={`${cat}-${idx}`} className="mb-1">
                                                <div className="flex justify-between font-semibold"><span className="truncate pr-2">{it.name}</span><span>₹{lineTotal.toLocaleString("en-IN")}</span></div>
                                                <div className="flex justify-between text-[10px]"><span>Qty: {it.quantity}</span><span>₹{Number(it.price || 0).toLocaleString("en-IN")} × {it.quantity}</span></div>
                                            </div>
                                        );
                                    })}
                                    <div className="border-t border-dashed border-gray-400 my-2"></div>
                                    <div className="flex justify-between"><span className="font-bold">Total</span><span className="font-bold">₹{catTotal.toLocaleString("en-IN")}</span></div>
                                    <div className="flex justify-between"><span className="font-bold">Items</span><span className="font-bold">{catQty}</span></div>
                                    <div className="border-t border-dashed border-gray-400 my-2"></div>
                                    <div className="text-center text-[10px] text-black space-y-1">
                                        <div>GST: 33CMMPP7822B1Z2</div>
                                        <div>Premium Cinema Experience</div>
                                        <div className="font-semibold">Thank You!</div>
                                        <div className="text-[9px]">மது அருந்தியவர்களுக்கு அனுமதி இல்லை. 3 வயது மற்றும் அதற்கு மேற்பட்டவர்களுக்கு டிக்கெட் கட்டாயம்.</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Summary Ticket */}
                    <div className="bg-white rounded border-2 border-gray-300" style={{ width: "280px", maxWidth: "280px" }}>
                        <div className="bg-black text-white text-center py-2 px-3">
                            <div className="text-sm font-bold mb-1">SENTHIL CINEMAS A/C</div>
                            <div className="text-xs font-semibold">ORDER SUMMARY</div>
                        </div>
                        <div className="p-3 text-xs space-y-1">
                            <div className="flex justify-between"><span className="font-semibold">Receipt No:</span><span>{receiptNo}</span></div>
                            <div className="flex justify-between items-center"><span className="font-semibold text-lg">Date:</span><span className="font-bold text-lg">{nowDate}</span></div>
                            <div className="flex justify-between items-center"><span className="font-semibold text-lg">Time:</span><span className="font-bold text-lg">{nowTime}</span></div>
                            <div className="flex justify-between items-center"><span className="font-semibold text-lg">Show Time:</span><span className="font-bold text-lg">{showTime}</span></div>
                            <div className="border-t border-dashed border-gray-400 my-2"></div>
                            <div className="text-black font-bold text-xs text-center">ORDER BREAKDOWN</div>
                            <div className="border-t-2 border-black my-1"></div>
                            {grouped.categories.map((cat) => {
                                const items = grouped.byCat[cat];
                                const catTotal = items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
                                const catQty = items.reduce((s, it) => s + Number(it.quantity || 0), 0);
                                return (
                                    <div key={`sum-${cat}`} className="mb-1">
                                        <div className="flex justify-between"><span>{cat}</span><span>{catQty} items</span></div>
                                        <div className="flex justify-end"><span>₹{catTotal.toLocaleString('en-IN')}</span></div>
                                    </div>
                                );
                            })}
                            <div className="border-t border-black my-2"></div>
                            <div className="flex justify-between"><span className="font-bold">Total Items:</span><span className="font-bold">{grouped.totals.count}</span></div>
                            <div className="flex justify-between text-black"><span className="font-bold">GRAND TOTAL:</span><span className="font-bold">₹{grouped.totals.amount.toLocaleString('en-IN')}</span></div>
                            <div className="border-t border-dashed border-gray-400 my-2"></div>
                            <div className="text-center text-[10px] text-black space-y-1">
                                <div>GST: 33CMMPP7822B1Z2</div>
                                <div>Premium Cinema Experience</div>
                                <div className="font-semibold">Thank You!</div>
                                <div className="text-[9px]">மது அருந்தியவர்களுக்கு அனுமதி இல்லை. 3 வயது மற்றும் அதற்கு மேற்பட்டவர்களுக்கு டிக்கெட் கட்டாயம்.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Close</button>
                    <button onClick={handlePrint} disabled={isPrinting} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 disabled:opacity-50">
                        <Printer size={18} /> {isPrinting ? "Printing..." : "Print"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SnacksReceiptPreviewPopup;


