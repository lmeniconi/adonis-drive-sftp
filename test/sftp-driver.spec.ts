/*
 * @lmeniconi/adonis-drive-sftp
 *
 * (c) Luciano Meniconi <luciano.meniconi.r@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import "reflect-metadata"
import test from "japa"
import { string } from "@poppinss/utils/build/helpers"

import { SftpDriver } from "../src/Drivers/Sftp"
import { authenticationOptions, stringToBuffer } from "../test-helpers"

test.group("SFTP driver | put", () => {
  test("write file to the destination", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `${string.generateRandom(10)}.txt`
    const data = stringToBuffer("hello world")

    const driver = new SftpDriver(config)
    await driver.connect()

    await driver.put(fileName, data)

    const contents = await driver.get(fileName)
    assert.equal(contents.toString(), "hello world")

    await driver.delete(fileName)
    await driver.disconnect()
  }).timeout(0)

  test("overwrite destination when already exists", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `${string.generateRandom(10)}.txt`
    const data = stringToBuffer("hello world")
    const data2 = stringToBuffer("hi world")

    const driver = new SftpDriver(config)
    await driver.connect()

    await driver.put(fileName, data)
    await driver.put(fileName, data2)

    const contents = await driver.get(fileName)
    assert.equal(contents.toString(), "hi world")

    await driver.delete(fileName)
    await driver.disconnect()
  }).timeout(0)
})

test.group("SFTP driver | exists", () => {
  test("return true when a file exists", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `${string.generateRandom(10)}.txt`
    const data = stringToBuffer("hello world")

    const driver = new SftpDriver(config)
    await driver.connect()

    await driver.put(fileName, data)
    assert.isTrue(await driver.exists(fileName))

    await driver.delete(fileName)
    await driver.disconnect()
  }).timeout(0)

  test("return false when a file doesn't exists", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `${string.generateRandom(10)}.txt`

    const driver = new SftpDriver(config)
    await driver.connect()

    assert.isFalse(await driver.exists(fileName))

    await driver.disconnect()
  }).timeout(0)
})

test.group("SFTP driver | delete", () => {
  test("remove file", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `${string.generateRandom(10)}.txt`
    const data = stringToBuffer("bar")

    const driver = new SftpDriver(config)
    await driver.connect()

    await driver.put(fileName, data)
    await driver.delete(fileName)

    assert.isFalse(await driver.exists(fileName))

    await driver.disconnect()
  }).timeout(0)

  test("do not error when trying to remove a non-existing file", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `${string.generateRandom(10)}.txt`

    const driver = new SftpDriver(config)
    await driver.connect()

    await driver.delete(fileName)
    assert.isFalse(await driver.exists(fileName))

    await driver.disconnect()
  }).timeout(0)

  test("do not error when file parent directory doesn't exists", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `bar/baz/${string.generateRandom(10)}.txt`

    const driver = new SftpDriver(config)
    await driver.connect()

    await driver.delete(fileName)
    assert.isFalse(await driver.exists(fileName))

    await driver.disconnect()
  }).timeout(0)
})

test.group("SFTP driver | copy", () => {
  test("copy file from within the disk root", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `${string.generateRandom(10)}.txt`
    const fileName2 = `${string.generateRandom(10)}.txt`
    const data = stringToBuffer("hello world")

    const driver = new SftpDriver(config)
    await driver.connect()

    await driver.put(fileName, data)
    await driver.copy(fileName, fileName2)

    const contents = await driver.get(fileName2)
    assert.equal(contents.toString(), "hello world")

    await driver.delete(fileName)
    await driver.delete(fileName2)

    await driver.disconnect()
  }).timeout(0)

  test("return error when source doesn't exists", async (assert) => {
    assert.plan(1)

    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }

    const driver = new SftpDriver(config)
    await driver.connect()

    try {
      await driver.copy("foo.txt", "bar.txt")
    } catch (error) {
      assert.equal(
        error.message,
        'E_CANNOT_COPY_FILE: Cannot copy file from "foo.txt" to "bar.txt"'
      )
    }

    await driver.disconnect()
  }).timeout(0)

  test("overwrite destination when already exists", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `${string.generateRandom(10)}.txt`
    const fileName2 = `${string.generateRandom(10)}.txt`
    const data = stringToBuffer("hello world")
    const data2 = stringToBuffer("hi world")

    const driver = new SftpDriver(config)
    await driver.connect()

    await driver.put(fileName, data)
    await driver.put(fileName2, data2)
    await driver.copy(fileName, fileName2)

    const contents = await driver.get(fileName2)
    assert.equal(contents.toString(), "hello world")

    await driver.delete(fileName)
    await driver.delete(fileName2)

    await driver.disconnect()
  }).timeout(0)
})

test.group("SFTP driver | move", () => {
  test("move file from within the disk root", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `${string.generateRandom(10)}.txt`
    const fileName1 = `${string.generateRandom(10)}.txt`
    const data = stringToBuffer("hello world")

    const driver = new SftpDriver(config)
    await driver.connect()

    await driver.put(fileName, data)
    await driver.move(fileName, fileName1)

    const contents = await driver.get(fileName1)
    assert.equal(contents.toString(), "hello world")
    assert.isFalse(await driver.exists(fileName))

    await driver.delete(fileName1)

    await driver.disconnect()
  }).timeout(0)

  test("return error when source doesn't exists", async (assert) => {
    assert.plan(1)

    const config = {
      ...authenticationOptions,

      driver: "sftp" as const,
    }

    const driver = new SftpDriver(config)
    await driver.connect()

    try {
      await driver.move("foo.txt", "baz/bar.txt")
    } catch (error) {
      assert.equal(
        error.message,
        'E_CANNOT_MOVE_FILE: Cannot move file from "foo.txt" to "baz/bar.txt"'
      )
    }

    await driver.disconnect()
  }).timeout(0)

  test("overwrite destination when already exists", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `${string.generateRandom(10)}.txt`
    const fileName1 = `${string.generateRandom(10)}.txt`
    const data = stringToBuffer("hello world")
    const data2 = stringToBuffer("hi world")

    const driver = new SftpDriver(config)
    await driver.connect()

    await driver.put(fileName, data)
    await driver.put(fileName1, data2)

    await driver.move(fileName, fileName1)

    const contents = await driver.get(fileName1)
    assert.equal(contents.toString(), "hello world")

    await driver.delete(fileName1)

    await driver.disconnect()
  }).timeout(0)
})

test.group("GCS driver | get", () => {
  test("get file contents", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `${string.generateRandom(10)}.txt`
    const data = stringToBuffer("hello world")

    const driver = new SftpDriver(config)
    await driver.connect()

    await driver.put(fileName, data)

    const contents = await driver.get(fileName)
    assert.equal(contents.toString(), "hello world")

    await driver.delete(fileName)

    await driver.disconnect()
  }).timeout(0)

  test("return error when file doesn't exists", async (assert) => {
    assert.plan(1)
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }

    const driver = new SftpDriver(config)
    await driver.connect()

    try {
      await driver.get("foo.txt")
    } catch (error) {
      assert.equal(
        error.message,
        'E_CANNOT_READ_FILE: Cannot read file from location "foo.txt"'
      )
    }

    await driver.disconnect()
  }).timeout(0)
})

test.group("GCS driver | getStats", () => {
  test("get file stats", async (assert) => {
    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }
    const fileName = `${string.generateRandom(10)}.txt`
    const data = stringToBuffer("hello world")

    const driver = new SftpDriver(config)
    await driver.connect()

    await driver.put(fileName, data)

    const stats = await driver.getStats(fileName)
    assert.equal(stats.size, 11)
    assert.instanceOf(stats.modified, Date)

    await driver.delete(fileName)

    await driver.disconnect()
  }).timeout(0)

  test("return error when file is missing", async (assert) => {
    assert.plan(1)

    const config = {
      ...authenticationOptions,
      driver: "sftp" as const,
    }

    const driver = new SftpDriver(config)
    await driver.connect()

    const fileName = `${string.generateRandom(10)}.txt`

    try {
      await driver.getStats(fileName)
    } catch (error) {
      assert.equal(
        error.message,
        `E_CANNOT_GET_METADATA: Unable to retrieve the "stats" for file at location "${fileName}"`
      )
    }

    await driver.disconnect()
  }).timeout(0)
})
