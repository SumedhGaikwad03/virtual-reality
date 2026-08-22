import "dotenv/config";
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import {
  AdminCreationError,
  createAdmin,
} from "../services/auth.service.js";
import { prisma } from "../lib/prisma.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function readVisible(prompt: string) {
  const readline = createInterface({ input: stdin, output: stdout });
  try {
    return await readline.question(prompt);
  } finally {
    readline.close();
  }
}

async function readHidden(prompt: string) {
  if (!stdin.isTTY || !stdin.setRawMode) {
    return readVisible(prompt);
  }

  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  return new Promise<string>((resolve, reject) => {
    let value = "";

    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode?.(false);
      stdout.write("\n");
    };

    const onData = (chunk: string | Buffer) => {
      for (const character of chunk.toString()) {
        if (character === "\u0003") {
          cleanup();
          reject(new Error("Admin creation cancelled"));
          return;
        }

        if (character === "\r" || character === "\n") {
          cleanup();
          resolve(value);
          return;
        }

        if (character === "\u0008" || character === "\u007f") {
          value = value.slice(0, -1);
          continue;
        }

        value += character;
      }
    };

    stdin.on("data", onData);
  });
}

async function mainPiped() {
  const [rawEmail = "", password = "", name = ""] = readFileSync(
    0,
    "utf8",
  ).split(/\r?\n/);
  stdout.write("Admin email: ");
  stdout.write("Password: ");
  stdout.write("Name (optional): ");

  const email = rawEmail.trim().toLowerCase();

  if (!emailPattern.test(email)) {
    throw new Error("Enter a valid email address");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  return createAdmin({ email, password, name: name.trim() });
}

async function main() {
  if (!stdin.isTTY || !stdin.setRawMode) {
    return mainPiped();
  }

  const rawEmail = await readVisible("Admin email: ");
  const email = rawEmail.trim().toLowerCase();

  if (!emailPattern.test(email)) {
    throw new Error("Enter a valid email address");
  }

  const password = await readHidden("Password: ");

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const name = (await readVisible("Name (optional): ")).trim();
  const admin = await createAdmin({ email, password, name });

  console.log(`Admin created successfully for ${admin.email}`);
}

try {
  await main();
} catch (error) {
  if (error instanceof AdminCreationError && error.code === "ADMIN_EXISTS") {
    console.error(error.message);
  } else if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Admin creation failed");
  }
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
