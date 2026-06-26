const fs = require('fs');
const path = require('path');

const files = [
  'src/app/api/admin/analytics/route.ts',
  'src/app/api/admin/pages/route.ts',
  'src/app/api/admin/pages/[id]/route.ts',
  'src/app/api/admin/pages/[id]/videos/route.ts',
  'src/app/api/admin/wilayas/route.ts',
  'src/app/api/orders/[id]/route.ts',
];

const authImport = `import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";`;

const authCheck = `  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
`;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if already protected
  if (content.includes('getServerSession')) {
    console.log(`Skipping ${file}`);
    continue;
  }

  // 1. Add imports after existing imports
  // Find last import
  const importMatches = [...content.matchAll(/^import .* from .*;$/gm)];
  if (importMatches.length > 0) {
    const lastMatch = importMatches[importMatches.length - 1];
    const insertPos = lastMatch.index + lastMatch[0].length;
    content = content.slice(0, insertPos) + '\n' + authImport + content.slice(insertPos);
  } else {
    content = authImport + '\n' + content;
  }

  // Ensure NextResponse is imported
  if (!content.includes('NextResponse')) {
    content = content.replace('import { NextRequest } from "next/server";', 'import { NextRequest, NextResponse } from "next/server";');
    if (!content.includes('NextResponse')) {
        content = `import { NextResponse } from "next/server";\n` + content;
    }
  }

  // 2. Inject auth check at the start of every exported async function
  content = content.replace(/(export async function \w+\([^)]*\)\s*\{)/g, `$1\n${authCheck}`);

  fs.writeFileSync(file, content);
  console.log(`Protected ${file}`);
}
