import assert from "assert";
import { TestSuite } from ".";
import { instance } from "../instantiate";
import { commands } from "vscode";

export const ConnectionSuite: TestSuite = {
  name: `Connection tests`,
  tests: [
    {name: `Test sendCommand`, test: async () => {
      const connection = instance.getConnection();
  
      const result = await connection?.sendCommand({
        command: `echo "Hello world"`,
      });
  
      assert.strictEqual(result?.code, 0);
      assert.strictEqual(result?.stdout, `Hello world`);
    }},
  
    {name: `Test sendCommand home directory`, test: async () => {
      const connection = instance.getConnection();
  
      const resultA = await connection?.sendCommand({
        command: `pwd`,
        directory: `/QSYS.LIB`
      });
  
      assert.strictEqual(resultA?.code, 0);
      assert.strictEqual(resultA?.stdout, `/QSYS.LIB`);
  
      const resultB = await connection?.sendCommand({
        command: `pwd`,
        directory: `/home`
      });
  
      assert.strictEqual(resultB?.code, 0);
      assert.strictEqual(resultB?.stdout, `/home`);
  
      const resultC = await connection?.sendCommand({
        command: `pwd`,
        directory: `/badnaughty`
      });
  
      assert.notStrictEqual(resultC?.stdout, `/badnaughty`);
    }},
  
    {name: `Test sendCommand with environment variables`, test: async () => {
      const connection = instance.getConnection();
  
      const result = await connection?.sendCommand({
        command: `echo "$vara $varB $VARC"`,
        env: {
          vara: `Hello`,
          varB: `world`,
          VARC: `cool`
        }
      });
  
      assert.strictEqual(result?.code, 0);
      assert.strictEqual(result?.stdout, `Hello world cool`);
    }},
  
    {name: `Test getTempRemote`, test: async () => {
      const connection = instance.getConnection();
  
      const fileA = connection?.getTempRemote(`/some/file`);
      const fileB = connection?.getTempRemote(`/some/badfile`);
      const fileC = connection?.getTempRemote(`/some/file`);
  
      assert.strictEqual(fileA, fileC);
      assert.notStrictEqual(fileA, fileB);
    }},
  
    {name: `Test parserMemberPath (simple)`, test: async () => {
      const connection = instance.getConnection();
  
      const memberA = connection?.parserMemberPath(`/thelib/thespf/thembr.mbr`);
  
      assert.strictEqual(memberA?.asp, undefined);
      assert.strictEqual(memberA?.library, `THELIB`);
      assert.strictEqual(memberA?.file, `THESPF`);
      assert.strictEqual(memberA?.name, `THEMBR`);
      assert.strictEqual(memberA?.extension, `MBR`);
      assert.strictEqual(memberA?.basename, `THEMBR.MBR`);
    }},
  
    {name: `Test parserMemberPath (ASP)`, test: async () => {
      const connection = instance.getConnection();
  
      const memberA = connection?.parserMemberPath(`/theasp/thelib/thespf/thembr.mbr`);
  
      assert.strictEqual(memberA?.asp, `THEASP`);
      assert.strictEqual(memberA?.library, `THELIB`);
      assert.strictEqual(memberA?.file, `THESPF`);
      assert.strictEqual(memberA?.name, `THEMBR`);
      assert.strictEqual(memberA?.extension, `MBR`);
      assert.strictEqual(memberA?.basename, `THEMBR.MBR`);
    }},
  
    {name: `Test parserMemberPath (no root)`, test: async () => {
      const connection = instance.getConnection();
  
      const memberA = connection?.parserMemberPath(`thelib/thespf/thembr.mbr`);
  
      assert.strictEqual(memberA?.asp, undefined);
      assert.strictEqual(memberA?.library, `THELIB`);
      assert.strictEqual(memberA?.file, `THESPF`);
      assert.strictEqual(memberA?.name, `THEMBR`);
      assert.strictEqual(memberA?.extension, `MBR`);
      assert.strictEqual(memberA?.basename, `THEMBR.MBR`);
    }},
  
    {name: `Test parserMemberPath (no extension)`, test: async () => {
      const connection = instance.getConnection();
  
      try {
        const memberA = connection?.parserMemberPath(`thelib/thespf/thembr`);
      } catch (e: any) {
        assert.strictEqual(e.message, `Source Type extension is required.`);
      }
    }},
  
    {name: `Test parserMemberPath (invalid length)`, test: async () => {
      const connection = instance.getConnection();
  
      try {
        const memberA = connection?.parserMemberPath(`/thespf/thembr.mbr`);
      } catch (e: any) {
        assert.strictEqual(e.message, `Invalid path: /thespf/thembr.mbr. Use format LIB/SPF/NAME.ext`);
      }
    }},

    {name: `Test runCommand (ILE)`, test: async () => {
      const connection = instance.getConnection();
  
      const result = await connection?.runCommand({
        command: `DSPLIBL`,
        environment: `ile`
      });
  
      assert.strictEqual(result?.code, 0);
      assert.strictEqual(result.stdout.includes(`Library List`), true);
    }},

    {name: `runCommand API compared to code-for-ibmi.runCommand (deprecated)`, test: async () => {
      const connection = instance.getConnection();
  
      const resultA = await connection?.runCommand({
        command: `DSPLIBL`,
        environment: `ile`
      });
  
      const resultB = await commands.executeCommand(`code-for-ibmi.runCommand`, {
        command: `DSPLIBL`,
        environment: `ile`
      });

      assert.deepStrictEqual(resultA, resultB);
    }},

    {name: `Test runCommand (ILE, custom libl)`, test: async () => {
      const connection = instance.getConnection();
  
      const resultA = await connection?.runCommand({
        command: `DSPLIBL`,
        environment: `ile`
      });
  
      assert.strictEqual(resultA?.code, 0);
      assert.strictEqual(resultA.stdout.includes(`QSYSINC     CUR`), false);
      assert.strictEqual(resultA.stdout.includes(`QSYSINC     USR`), false);
  
      const resultB = await connection?.runCommand({
        command: `DSPLIBL`,
        environment: `ile`,
        env: {
          '&LIBL': `QSYSINC`,
          '&CURLIB': `QSYSINC`
        }
      });
  
      assert.strictEqual(resultB?.code, 0);
      assert.strictEqual(resultB.stdout.includes(`QSYSINC     CUR`), true);
      assert.strictEqual(resultB.stdout.includes(`QSYSINC     USR`), true);
    }},
  ]
};
