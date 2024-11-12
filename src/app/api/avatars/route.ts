// File: app/api/avatars/route.ts

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/utils/db";
import { Avatar } from "@/types/type";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {

    const userId = 5;
    const id = 15;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "ID parameter is missing" }, { status: 400 });
    }

    const avatarQuery = "SELECT * FROM Avatars WHERE id = ? AND user_id = ?";
    const avatar = await query<Avatar[]>(avatarQuery, [id, userId]);

    if (avatar.length === 0) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    return NextResponse.json({ data: avatar[0], success: true }); // Return the selected avatar
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return NextResponse.json(
      { error: "Error processing the request" },
      { status: 500 }
    );
  }
}
