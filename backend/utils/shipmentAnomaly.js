function buildStats(shipments) {
  const routeStats = new Map();
  const routeCargoRiskStats = new Map();

  shipments.forEach((shipment) => {
    const routeKey = `${shipment.origin}::${shipment.destination}`;
    const routeCargoKey = `${routeKey}::${shipment.cargoType}`;

    const route = routeStats.get(routeKey) || { total: 0, delayed: 0 };
    route.total += 1;
    if (shipment.status === 'Delayed') {
      route.delayed += 1;
    }
    routeStats.set(routeKey, route);

    const routeCargo = routeCargoRiskStats.get(routeCargoKey) || { total: 0, riskSum: 0 };
    routeCargo.total += 1;
    routeCargo.riskSum += Number(shipment.riskScore || 0);
    routeCargoRiskStats.set(routeCargoKey, routeCargo);
  });

  return { routeStats, routeCargoRiskStats };
}

function evaluateShipment(shipment, stats, now = new Date()) {
  const anomalies = [];
  let anomalyScore = 0;

  const expectedArrival = shipment.expectedArrival ? new Date(shipment.expectedArrival) : null;

  if (expectedArrival && expectedArrival < now && shipment.status !== 'Completed') {
    anomalies.push({
      code: 'OVERDUE_SHIPMENT',
      severity: 'high',
      reason: 'Expected arrival date has passed while shipment is not completed.',
    });
    anomalyScore += 35;
  }

  if (shipment.status === 'Delayed' && Number(shipment.riskScore || 0) >= 60) {
    anomalies.push({
      code: 'DELAYED_HIGH_RISK',
      severity: 'high',
      reason: 'Shipment is delayed and has a high risk score.',
    });
    anomalyScore += 25;
  }

  if (Number(shipment.compliancePercentage || 0) <= 50) {
    anomalies.push({
      code: 'LOW_COMPLIANCE',
      severity: 'high',
      reason: 'Compliance percentage is critically low.',
    });
    anomalyScore += 25;
  } else if (Number(shipment.compliancePercentage || 0) <= 65) {
    anomalies.push({
      code: 'COMPLIANCE_WARNING',
      severity: 'medium',
      reason: 'Compliance percentage is below safe threshold.',
    });
    anomalyScore += 15;
  }

  const routeKey = `${shipment.origin}::${shipment.destination}`;
  const routeCargoKey = `${routeKey}::${shipment.cargoType}`;

  const route = stats.routeStats.get(routeKey);
  if (route && route.total >= 3) {
    const delayedRatio = route.delayed / route.total;
    if (delayedRatio >= 0.4) {
      anomalies.push({
        code: 'ROUTE_DELAY_PATTERN',
        severity: 'medium',
        reason: 'This route has an unusually high recent delay ratio.',
      });
      anomalyScore += 15;
    }
  }

  const routeCargo = stats.routeCargoRiskStats.get(routeCargoKey);
  if (routeCargo && routeCargo.total >= 3) {
    const baselineRisk = routeCargo.riskSum / routeCargo.total;
    if (Number(shipment.riskScore || 0) >= baselineRisk + 20) {
      anomalies.push({
        code: 'RISK_ABOVE_ROUTE_CARGO_BASELINE',
        severity: 'medium',
        reason: 'Risk score is significantly above route and cargo baseline.',
      });
      anomalyScore += 15;
    }
  }

  const severity = anomalyScore >= 45 ? 'high' : anomalyScore >= 20 ? 'medium' : 'low';

  return {
    anomalies,
    anomalyScore,
    anomalySeverity: anomalies.length ? severity : null,
    isUnusual: anomalies.length > 0,
  };
}

function enrichShipmentsWithAnomalies(shipments) {
  const normalized = shipments.map((shipment) =>
    typeof shipment.toObject === 'function' ? shipment.toObject() : shipment
  );
  const stats = buildStats(normalized);

  return normalized.map((shipment) => ({
    ...shipment,
    ...evaluateShipment(shipment, stats),
  }));
}

function enrichShipmentWithAnomalies(shipment, allShipments) {
  const normalizedTarget = typeof shipment.toObject === 'function' ? shipment.toObject() : shipment;
  const normalizedAll = allShipments.map((s) => (typeof s.toObject === 'function' ? s.toObject() : s));
  const stats = buildStats(normalizedAll);

  return {
    ...normalizedTarget,
    ...evaluateShipment(normalizedTarget, stats),
  };
}

module.exports = {
  enrichShipmentsWithAnomalies,
  enrichShipmentWithAnomalies,
};
