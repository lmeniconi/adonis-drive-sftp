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
} from "@adonisjs/core/build/standalone"

import {
  DriveFileStats,
  SftpDriverConfig,
  SftpDriverContract,
  Visibility,
} from "@ioc:Adonis/Core/Drive"

import SftpClient from "ssh2-sftp-client"

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
  public async connect(): Promise<void> {
    await this.adapter.connect({
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
      password: this.config.password,
    })
  }

  /**
   * Disconnect from the sftp server
   */
  public async disconnect(): Promise<void> {
    await this.adapter.end()
  }

  /**
   * Returns the file contents as a buffer. The buffer return
   * value allows you to self choose the encoding when
   * converting the buffer to a string.
   */
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
  public async put(location: string, contents: Buffer | string): Promise<void> {
    try {
      await this.adapter.put(contents, location)
    } catch (error) {
      console.error(error)
      throw CannotWriteFileException.invoke(location, error)
    }
  }

  /**
   * Remove a given location path
   */
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
