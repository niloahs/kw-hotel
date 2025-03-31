import { NextResponse } from "next/server";
import db from "@/lib/db";
import { ServiceCharge } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received Data:', body);
    const { selectedServices, reservationId } = body;

    if (!selectedServices || selectedServices.length === 0 || !reservationId) {
      console.error('Missing required service selection or reservation ID');
      return NextResponse.json({ message: 'Missing required service selection or reservation ID' }, { status: 400 });
    }

    // Start a transaction to ensure data consistency
    return await db.transaction(async (client) => {
      // Insert service charges
      const insertQuery = `
        INSERT INTO service_charge (service_id, reservation_id, quantity, charged_amount)
        VALUES ($1, $2, $3, $4)
      `;

      for (const charge of selectedServices) {
        console.log('Inserting service charge for serviceId:', charge.serviceId);
        await client.query(insertQuery, [
          charge.serviceId,
          charge.reservationId,
          charge.quantity,
          charge.chargedAmount,
        ]);
      }

      // Calculate total service charges
      const totalServiceCharge = selectedServices.reduce((sum: number, charge: ServiceCharge) => sum + charge.chargedAmount, 0);
      console.log("#########################");
      console.log('Total service charge:', totalServiceCharge);
      console.log("#########################");



      // Get current reservation total
      const reservationResult = await client.query(
        'SELECT total_amount FROM reservation WHERE reservation_id = $1',
        [reservationId]
      );
      console.log("#########################2");
      console.log('Reservation result:', reservationResult.rows[0].total_amount);
      console.log("#########################2");

      if (reservationResult.rowCount === 0) {
        throw new Error('Reservation not found');
      }

      const currentTotal = parseFloat(reservationResult.rows[0].total_amount);
      const newTotal = currentTotal + totalServiceCharge;

      console.log("#########################3");
      console.log('New total:', newTotal);
      console.log("#########################3");
      // Update reservation total amount
      await client.query(
        'UPDATE reservation SET total_amount = $1 WHERE reservation_id = $2',
        [newTotal, reservationId]
      );

      console.log('Successfully updated reservation total amount');
      return NextResponse.json({ 
        success: true, 
        message: 'Service charges have been successfully added to the reservation.',
        newTotal
      });
    });
  } catch (error) {
    console.error('Error adding service charges:', error);
    const errorMessage = (error as Error).message;
    return NextResponse.json({ message: 'An error occurred while adding service charges', error: errorMessage }, { status: 500 });
  }
}
