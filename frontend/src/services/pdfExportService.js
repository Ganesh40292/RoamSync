export const exportTripToPdf = (trip) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download the PDF booklet.');
    return;
  }

  const itinerariesHtml = (trip.itineraries || [])
    .map(
      (item) => `
      <div style="padding: 10px; border-left: 3px solid #7c3aed; margin-bottom: 10px; background: #f9fafb; border-radius: 4px;">
        <strong style="font-size: 14px; color: #111827;">Day ${item.dayNumber}: ${item.title}</strong>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #4b5563;">${item.description || 'Scheduled activity'}</p>
      </div>`
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>RoamMate — ${trip.name} Travel Booklet</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1f2937; }
          .header { text-align: center; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 28px; color: #7c3aed; margin: 0; }
          .subtitle { font-size: 14px; color: #6b7280; margin-top: 5px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; color: #06b6d4; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
          .meta-card { background: #f3f4f6; padding: 12px; borderRadius: 6px; }
          .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">🌍 ${trip.name}</h1>
          <p class="subtitle">Official RoamMate 🌍 Travel Companion Booklet</p>
        </div>

        <div class="meta-grid">
          <div class="meta-card">
            <strong>📅 Dates:</strong> ${trip.startDate} to ${trip.endDate}
          </div>
          <div class="meta-card">
            <strong>👥 Members:</strong> ${(trip.members || []).map((m) => m.fullName || m.username).join(', ')}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">🗺️ Scheduled Itinerary</h2>
          ${itinerariesHtml || '<p>No itineraries scheduled yet.</p>'}
        </div>

        <div class="footer">
          Generated automatically by <strong>RoamMate 🌍</strong> • Safe Travels!
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
