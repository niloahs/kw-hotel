import { NextResponse } from "next/server";
import db from "@/lib/db";
import auth from "@/lib/auth";

// Check if a room type is a favorite
export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url);
        const roomTypeId = searchParams.get('roomTypeId');

        if (!roomTypeId) {
            return NextResponse.json({message: 'Room type ID required'}, {status: 400});
        }

        const user = await auth.getCurrentUser();
        if (!user) {
            return NextResponse.json({message: 'Authentication required'}, {status: 401});
        }

        const result = await db.query(
            `SELECT *
             FROM guest_preference
             WHERE guest_id = $1
               AND room_type_id = $2`,
            [user.id, roomTypeId]
        );

        return NextResponse.json({isFavorite: result.rowCount! > 0});
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {message: 'An error occurred checking preference'},
            {status: 500}
        );
    }
}

// Add a favorite
export async function POST(request: Request) {
    try {
        const {roomTypeId} = await request.json();
        const user = await auth.getCurrentUser();

        if (!user) {
            return NextResponse.json({message: 'Authentication required'}, {status: 401});
        }

        // Check if already exists - if it does, don't create a duplicate
        const existingPref = await db.query(
            `SELECT *
             FROM guest_preference
             WHERE guest_id = $1
               AND room_type_id = $2`,
            [user.id, roomTypeId]
        );

        if (existingPref.rowCount === 0) {
            await db.query(
                `INSERT INTO guest_preference (guest_id, room_type_id)
                 VALUES ($1, $2)`,
                [user.id, roomTypeId]
            );
        }

        return NextResponse.json({success: true, message: "Preference added"});
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {message: 'An error occurred saving preference'},
            {status: 500}
        );
    }
}

// Remove a favorite
export async function DELETE(request: Request) {
    try {
        const {searchParams} = new URL(request.url);
        const roomTypeId = searchParams.get('roomTypeId');
        const user = await auth.getCurrentUser();

        if (!user) {
            return NextResponse.json({message: 'Authentication required'}, {status: 401});
        }

        // Delete the preference record
        const result = await db.query(
            `DELETE
             FROM guest_preference
             WHERE guest_id = $1
               AND room_type_id = $2
             RETURNING guest_preference_id`,
            [user.id, roomTypeId]
        );

        // Check if anything was deleted
        if (result.rowCount === 0) {
            return NextResponse.json({
                success: true,
                message: "No preference found to delete"
            });
        }

        return NextResponse.json({
            success: true,
            message: "Preference removed"
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {message: 'An error occurred removing preference'},
            {status: 500}
        );
    }
}