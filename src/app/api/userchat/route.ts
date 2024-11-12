// File: app/api/avatars/route.ts

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/utils/db";
import { Avatar } from "@/types/type";

export const dynamic = "force-dynamic";


export async function GET(req: NextRequest) {
  try {
    const userId = 5;
    const avatarId = 15;

    const chatQuery =
      "SELECT * FROM User_Chat_Setting WHERE avatar_id = ? AND user_id = ?";
    const chat = await query<Avatar[]>(chatQuery, [avatarId, userId]);

    if (chat.length === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ data: chat[0], success: true });
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return NextResponse.json(
      { error: "Error processing the request" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = 5;
    const avatarId = 15;

    const formData = await req.formData();

    // First check if record exists
    const checkExistingQuery =
      "SELECT id, logo, prompts, welcome_message FROM User_Chat_Setting WHERE user_id = ? AND avatar_id = ?";
    const existingRecord = await query<{
      id: number;
      logo: string | null;
      prompts: string | null;
      welcome_message: string | null;
    }[]>(checkExistingQuery, [userId, avatarId]);


    // Get other form data values, keeping them undefined if not provided
    const prompts = formData.get("prompts") as string | null;
    const welcomeMessage = formData.get("welcomeMessage") as string | null;

    let result;

    if (existingRecord && existingRecord.length > 0) {
      // Prepare update query dynamically based on provided fields
      const updates: string[] = [];
      const values: any[] = [];

      if (prompts !== null) {
        updates.push("prompts = ?");
        values.push(prompts);
      }

      if (welcomeMessage !== null) {
        updates.push("welcome_message = ?");
        values.push(welcomeMessage);
      }

      // Only update if there are fields to update
      if (updates.length > 0) {
        updates.push("created_at = ?");
        values.push(new Date());

        // Add WHERE clause parameters
        values.push(userId, avatarId);

        const updateQuery = `
          UPDATE User_Chat_Setting 
          SET ${updates.join(", ")}
          WHERE user_id = ? AND avatar_id = ?
        `;

        result = await query(updateQuery, values);

        return NextResponse.json({
          success: true,
          message: "Chat Data updated successfully",
          id: existingRecord[0].id,
          prompts: prompts || existingRecord[0].prompts,
          welcome_message: welcomeMessage || existingRecord[0].welcome_message
        });
      } else {
        // No fields to update
        return NextResponse.json({
          success: true,
          message: "No fields to update",
          id: existingRecord[0].id,
          prompts: existingRecord[0].prompts,
          welcome_message: existingRecord[0].welcome_message
        });
      }
    } else {
      // For new records, use provided values or nulls
      const insertQuery = `
        INSERT INTO User_Chat_Setting 
        (user_id, prompts, avatar_id, welcome_message, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      result = await query<{ insertId?: number }>(insertQuery, [
        userId,
        prompts || null,
        avatarId,
        welcomeMessage || null,
        new Date(),
      ]);

      return NextResponse.json({
        success: true,
        message: "Chat Data created successfully",
        insertedId: result.insertId,
        prompts: prompts || null,
        welcome_message: welcomeMessage || null
      });
    }
  } catch (error) {
    console.error("Error handling chat settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}