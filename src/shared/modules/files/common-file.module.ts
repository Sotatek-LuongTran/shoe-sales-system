import { Module } from "@nestjs/common";
import { FileRepository } from "./file.repository";

@Module({
    exports: [FileRepository]
})
export class CommonFileModule {}