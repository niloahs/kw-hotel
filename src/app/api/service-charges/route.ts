import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received Data:', body);
    const { selectedServices, reservationId } = body;

    if (!selectedServices || selectedServices.length === 0 || !reservationId) {
      console.error('Missing required service selection or reservation ID');
      return NextResponse.json({ message: 'Missing required service selection or reservation ID' }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO service_charge (service_id, reservation_id, quantity, charged_amount)
      VALUES ($1, $2, $3, $4)
    `;

    for (const charge of selectedServices) {
      console.log('Inserting service charge for serviceId:', charge.serviceId);  // Log each insertion
      await db.query(insertQuery, [
        charge.serviceId,
        charge.reservationId,
        charge.quantity,
        charge.chargedAmount,
      ]);
    }

    console.log('Successfully inserted service charges');
    return NextResponse.json({ success: true, message: 'Service charges have been successfully added to the reservation.' });
  } catch (error) {
    console.error('Error adding service charges:', error);
    const errorMessage = (error as Error).message;
    return NextResponse.json({ message: 'An error occurred while adding service charges', error: errorMessage }, { status: 500 });
  }
}
