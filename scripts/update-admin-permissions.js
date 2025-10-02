#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");

console.log(
  "🔧 Updating admin API permissions to include SUPER_ADMIN access..."
);

// Find all admin API route files
const apiDir = path.join(__dirname, "..", "app", "api", "admin");
const routeFiles = [];

function findRouteFiles(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findRouteFiles(fullPath);
    } else if (item === "route.ts") {
      routeFiles.push(fullPath);
    }
  }
}

findRouteFiles(apiDir);

console.log(`Found ${routeFiles.length} admin API route files:`);

let updatedCount = 0;

for (const filePath of routeFiles) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let hasChanges = false;

    // Pattern 1: session.user.role !== "ADMIN"
    if (content.includes('session.user.role !== "ADMIN"')) {
      content = content.replace(
        /session\.user\.role !== "ADMIN"/g,
        '!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)'
      );
      hasChanges = true;
    }

    // Pattern 2: More complex conditions that need updating
    const patterns = [
      {
        from: /if \(!session\?\.\user \|\| session\.user\.role !== "ADMIN"\)/g,
        to: 'if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role))',
      },
      {
        from: /if \(!session\?\.\user\?\.\id \|\| session\.user\.role !== "ADMIN"\)/g,
        to: 'if (!session?.user?.id || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role))',
      },
      {
        from: /if \(session\.user\.role !== "ADMIN"\)/g,
        to: 'if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role))',
      },
    ];

    for (const pattern of patterns) {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
      updatedCount++;
    } else {
      console.log(
        `⏭️  No changes needed: ${path.relative(process.cwd(), filePath)}`
      );
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log(
  `\n🎉 Updated ${updatedCount} files to include SUPER_ADMIN permissions!`
);
console.log(
  "✅ Super Admin users can now access all admin functionality including assessment creation."
);
