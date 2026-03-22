function normalizeDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function getLocationProgress(shipment) {
  const location = `${shipment.currentLocation || ''}`.toLowerCase();
  const origin = `${shipment.origin || ''}`.toLowerCase();
  const destination = `${shipment.destination || ''}`.toLowerCase();

  if (!location || location.includes(origin) || location.includes('origin')) {
    return 0.1;
  }

  if (location.includes(destination)) {
    return 1;
  }

  if (location.includes('port')) {
    return 0.8;
  }

  if (
    location.includes('ocean') ||
    location.includes('sea') ||
    location.includes('channel')
  ) {
    return 0.55;
  }

  if (
    location.includes('transit') ||
    location.includes('route') ||
    location.includes('hub')
  ) {
    return 0.65;
  }

  return 0.4;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function predictShipmentDelay(shipment) {
  const departureDate = normalizeDate(shipment.departureDate);
  const expectedArrival = normalizeDate(shipment.expectedArrival);
  const now = new Date();

  if (!departureDate || !expectedArrival) {
    return {
      label: 'Unknown',
      probability: 0.5,
      confidence: 'Low',
      score: 50,
      summary: 'Not enough shipment dates to predict delay.',
    };
  }

  const totalDurationDays = Math.max(
    1,
    (expectedArrival - departureDate) / (1000 * 60 * 60 * 24)
  );
  const elapsedDays = Math.max(
    0,
    (now - departureDate) / (1000 * 60 * 60 * 24)
  );
  const expectedProgress = clamp(elapsedDays / totalDurationDays, 0, 1.4);
  const locationProgress = getLocationProgress(shipment);

  let delayScore = 25;

  if (shipment.status === 'Delayed') {
    delayScore += 35;
  }

  if (shipment.status === 'Completed') {
    delayScore -= 30;
  }

  if (elapsedDays > totalDurationDays) {
    delayScore += 30;
  }

  delayScore += (expectedProgress - locationProgress) * 45;

  if (shipment.riskScore >= 70) {
    delayScore += 10;
  } else if (shipment.riskScore >= 40) {
    delayScore += 5;
  }

  if (shipment.compliancePercentage < 60) {
    delayScore += 12;
  } else if (shipment.compliancePercentage < 80) {
    delayScore += 6;
  }

  if (shipment.currentLocation && shipment.destination) {
    const sameLocation =
      shipment.currentLocation.toLowerCase() === shipment.destination.toLowerCase();
    if (sameLocation) {
      delayScore -= 20;
    }
  }

  const probability = clamp(delayScore / 100, 0.05, 0.95);
  const predictedDelayed = probability >= 0.55;
  const confidenceScore = Math.abs(probability - 0.5);

  return {
    label: predictedDelayed ? 'Likely Delayed' : 'Likely On Time',
    probability,
    confidence:
      confidenceScore >= 0.3 ? 'High' : confidenceScore >= 0.15 ? 'Medium' : 'Low',
    score: Math.round(probability * 100),
    summary: predictedDelayed
      ? 'The shipment appears behind schedule for its expected timeline.'
      : 'The shipment appears on track for its expected arrival date.',
    expectedProgress: Math.round(clamp(expectedProgress, 0, 1) * 100),
    locationProgress: Math.round(locationProgress * 100),
  };
}

module.exports = {
  predictShipmentDelay,
};
