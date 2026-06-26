import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function POST() {
  try {
    const { stdout, stderr } = await execPromise("npx prisma db push --accept-data-loss");
    return NextResponse.json({ ok: true, stdout, stderr });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { stdout, stderr } = await execPromise("npx prisma db push --accept-data-loss");
    return NextResponse.json({ ok: true, stdout, stderr });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
