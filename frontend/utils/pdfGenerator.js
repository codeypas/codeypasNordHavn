import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAllShipmentsPDF = (shipments) => {
  try {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('NordHavn Logistics - Shipments Report', 14, 20);
    
    // Meta info
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Shipments: ${shipments.length}`, 14, 37);
    
    // Table
    const columns = ['Shipment ID', 'Origin', 'Destination', 'Status', 'Risk', 'Compliance'];
    const rows = shipments.map((s) => [
      s.shipmentId || 'N/A',
      s.origin || 'N/A',
      s.destination || 'N/A',
      s.status || 'N/A',
      (s.riskScore || 0).toString(),
      (s.compliancePercentage || 0).toString() + '%',
    ]);
    
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 45,
      theme: 'grid',
      margin: { top: 45 },
      headerStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });
    
    doc.save(`NordHavn-Shipments-${Date.now()}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

export const generateSingleShipmentPDF = (shipment) => {
  try {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('NordHavn Logistics - Shipment Report', 14, 20);
    
    // Shipment ID
    doc.setFontSize(14);
    doc.text(`Shipment: ${shipment.shipmentId || 'N/A'}`, 14, 40);
    
    // Details in table format
    const details = [
      { label: 'Origin', value: shipment.origin || 'N/A' },
      { label: 'Destination', value: shipment.destination || 'N/A' },
      { label: 'Status', value: shipment.status || 'N/A' },
      { label: 'Current Location', value: shipment.currentLocation || 'N/A' },
      { label: 'Departure Date', value: shipment.departureDate ? new Date(shipment.departureDate).toLocaleDateString() : 'N/A' },
      { label: 'Expected Arrival', value: shipment.expectedArrival ? new Date(shipment.expectedArrival).toLocaleDateString() : 'N/A' },
      { label: 'Risk Score', value: (shipment.riskScore || 0).toString() },
      { label: 'Compliance', value: (shipment.compliancePercentage || 0).toString() + '%' },
      { label: 'Cargo Type', value: shipment.cargoType || 'N/A' },
      { label: 'Weight (kg)', value: (shipment.weight || 0).toString() },
      { label: 'Value', value: '$' + (shipment.value || 0).toString() },
    ];
    
    let yPos = 55;
    doc.setFontSize(11);
    
    details.forEach(({ label, value }) => {
      doc.setFont(undefined, 'bold');
      doc.text(label + ':', 14, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(String(value), 70, yPos);
      yPos += 8;
    });
    
    // Footer
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPos + 5);
    
    doc.save(`NordHavn-Shipment-${shipment.shipmentId || Date.now()}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};
