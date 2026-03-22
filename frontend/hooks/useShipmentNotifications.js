import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';

function buildShipmentSnapshot(shipment) {
  return JSON.stringify({
    shipmentId: shipment.shipmentId,
    status: shipment.status,
    origin: shipment.origin,
    destination: shipment.destination,
    currentLocation: shipment.currentLocation,
    riskScore: shipment.riskScore,
    compliancePercentage: shipment.compliancePercentage,
    updatedAt: shipment.updatedAt,
  });
}

export function useShipmentNotifications(shipments, enabled = true) {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const previousShipmentsRef = useRef(null);

  useEffect(() => {
    if (!enabled || !Array.isArray(shipments)) {
      return;
    }

    const previousShipments = previousShipmentsRef.current;
    const currentMap = new Map(
      shipments.map((shipment) => [shipment._id, buildShipmentSnapshot(shipment)])
    );

    if (!previousShipments) {
      previousShipmentsRef.current = currentMap;
      return;
    }

    const addedShipments = shipments.filter(
      (shipment) => !previousShipments.has(shipment._id)
    );
    const updatedShipments = shipments.filter((shipment) => {
      const previousSnapshot = previousShipments.get(shipment._id);
      return previousSnapshot && previousSnapshot !== buildShipmentSnapshot(shipment);
    });
    const removedShipments = Array.from(previousShipments.keys()).filter(
      (shipmentId) => !currentMap.has(shipmentId)
    );

    addedShipments.slice(0, 3).forEach((shipment) => {
      addNotification(`New shipment added: ${shipment.shipmentId}`, 'success');
    });

    updatedShipments.slice(0, 3).forEach((shipment) => {
      addNotification(`Shipment updated: ${shipment.shipmentId}`, 'success');
    });

    removedShipments.slice(0, 3).forEach(() => {
      addNotification('A shipment was removed', 'error');
    });

    if (addedShipments.length > 3) {
      addNotification(
        `${addedShipments.length - 3} more new shipments were added`,
        'success'
      );
    }

    if (updatedShipments.length > 3) {
      addNotification(
        `${updatedShipments.length - 3} more shipments were updated`,
        'success'
      );
    }

    if (removedShipments.length > 3) {
      addNotification(
        `${removedShipments.length - 3} more shipments were removed`,
        'error'
      );
    }

    previousShipmentsRef.current = currentMap;
  }, [addNotification, enabled, shipments]);
}

export default useShipmentNotifications;
