/*
 * @adonisjs/gcs
 *
 * (c) Luciano Meniconi
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  CannotCopyFileException,
  CannotMoveFileException,
  CannotReadFileException,
  CannotWriteFileException,
  CannotDeleteFileException,
  CannotGetMetaDataException,
  CannotSetVisibilityException,
  CannotListDirectoryException,
} from "@adonisjs/core/build/standalone"

import {
  DirectoryListingContract,
  DriveFileStats,
  DriveListItem,
  SftpDriverConfig,
  SftpDriverContract,
  Visibility,
} from "@ioc:Adonis/Core/Drive"

import SftpClient from "ssh2-sftp-client"

function connected(_, __, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    await this.ensureConnection()
    return await originalMethod.apply(this, args)
  }

  return descriptor
}

export class SftpDriver implements SftpDriverContract {
  /**
   * Reference to the sftp storage instance
   */
  public adapter: SftpClient

  /**
   * Name of the driver
   */
  public name: "sftp" = "sftp"

  constructor(private config: SftpDriverConfig) {
    this.adapter = new SftpClient()
  }

  /**
   * Connect to the sftp server
   */
  private async connect(): Promise<void> {
    await this.adapter.connect({
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
      password: this.config.password,
    })
  }

  /**
   * Check if we are connected to the sftp server.
   * Returns `true` when connected and `false` otherwise.
   */
  private async checkConnection(): Promise<boolean> {
    // @ts-ignore
    if (!this.adapter.sftp) return false

    try {
      await this.adapter.cwd()
    } catch {
      return false
    }

    return true
  }

  /**
   * Ensure that we are connected to the sftp server
   */
  private async ensureConnection(): Promise<void> {
    const isConnected = await this.checkConnection()
    if (!isConnected) await this.connect()
  }

  /**
   * Converts a string to a buffer
   */
  private stringToBuffer(value: string): Buffer {
    return Buffer.from(value)
  }

  /**
   * Disconnect from the sftp server
   */
  // private async disconnect(): Promise<void> {
  //   await this.adapter.end()
  //   this.adapter.stat
  // }

  /**
   * Returns the file contents as a buffer. The buffer return
   * value allows you to self choose the encoding when
   * converting the buffer to a string.
   */
  @connected
  public async get(location: string): Promise<Buffer> {
    let contents: Buffer
    try {
      contents = (await this.adapter.get(location)) as Buffer
    } catch (error) {
      throw CannotReadFileException.invoke(location, error)
    }

    return Buffer.from(contents)
  }

  /**
   * A boolean to find if the location path exists or not
   */
  @connected
  public async exists(location: string): Promise<boolean> {
    let exists: boolean
    try {
      exists = Boolean(await this.adapter.exists(location))
    } catch (error) {
      throw CannotGetMetaDataException.invoke(location, "exists", error)
    }

    return exists
  }

  /**
   * Returns the file stats
   */
  @connected
  public async getStats(location: string): Promise<DriveFileStats> {
    let metaData
    try {
      metaData = await this.adapter.stat(location)
    } catch (error) {
      throw CannotGetMetaDataException.invoke(location, "stats", error)
    }

    return {
      modified: new Date(metaData.modifyTime),
      size: metaData.size,
      isFile: true,
    }
  }

  /**
   * Write buffer contents to a destination.
   * if contents is a string, gonna search for the file in the local filesystem
   */
  @connected
  public async put(location: string, contents: Buffer | string): Promise<void> {
    try {
      const data =
        typeof contents === "string" ? this.stringToBuffer(contents) : contents

      await this.adapter.put(data, location)
    } catch (error) {
      console.error(error)
      throw CannotWriteFileException.invoke(location, error)
    }
  }

  /**
   * Remove a given location path
   */
  @connected
  public async delete(location: string): Promise<void> {
    try {
      const exists = await this.exists(location)
      if (!exists) return

      await this.adapter.delete(location)
    } catch (error) {
      throw CannotDeleteFileException.invoke(location, error)
    }
  }

  /**
   * Copy a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  @connected
  public async copy(source: string, destination: string): Promise<void> {
    try {
      const exists = await this.adapter.exists(destination)
      if (exists) await this.delete(destination)

      await this.adapter.rcopy(source, destination)
    } catch (error) {
      throw CannotCopyFileException.invoke(source, destination, error)
    }
  }

  /**
   * Move a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  @connected
  public async move(source: string, destination: string): Promise<void> {
    try {
      await this.copy(source, destination)
      await this.delete(source)
    } catch (error) {
      throw CannotMoveFileException.invoke(
        source,
        destination,
        error.original || error
      )
    }
  }

  /**
   * List all files inside a directory.
   * The function toArray must be called on the return value to fetch
   */
  public list(
    location: string
  ): DirectoryListingContract<this, DriveListItem<SftpClient.FileInfo>> {
    // @ts-ignore
    return {
      driver: this,
      toArray: async () => {
        try {
          await this.ensureConnection()

          const directory = await this.adapter.list(location)
          return directory.map((file) => ({
            isFile: file.type !== "d",
            location: `${location}/${file.name}`,
            original: file,
          }))
        } catch (error) {
          throw CannotListDirectoryException.invoke(location, error)
        }
      },
    }
  }

  /**
   * Not Supported
   *
   * Returns the file contents as a stream
   *
   */
  public async getStream(location: string): Promise<NodeJS.ReadableStream> {
    throw CannotReadFileException.invoke(location, "getStream is not supported")
  }

  /**
   * Not Supported
   *
   * Returns URL to a given path
   */
  public async getUrl(location: string): Promise<string> {
    throw CannotGetMetaDataException.invoke(
      location,
      "getUrl is not supported",
      "Not Supported"
    )
  }

  /**
   * Not Supported
   *
   * Returns the signed url for a given path
   */
  public async getSignedUrl(location: string): Promise<string> {
    throw CannotGetMetaDataException.invoke(
      location,
      "getSignedUrl is not supported",
      "Not Supported"
    )
  }

  /**
   * Not Supported
   *
   * Write a stream to a destination. The missing intermediate
   * directories will be created (if required).
   */
  public async putStream(location: string): Promise<void> {
    throw CannotWriteFileException.invoke(
      location,
      "putStream is not supported"
    )
  }

  /**
   * Not Supported
   *
   * Returns the file visibility
   *
   */
  public async getVisibility(location: string): Promise<Visibility> {
    throw CannotGetMetaDataException.invoke(
      location,
      "visibility",
      "Not Supported"
    )
  }

  /**
   * Not supported
   *
   * Sets the file visibility
   */
  public async setVisibility(location: string): Promise<void> {
    throw CannotSetVisibilityException.invoke(location, "Not Supported")
  }
}
