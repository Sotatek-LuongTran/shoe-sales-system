import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service";

@Module({
    exports: [StorageService]
})
export class CommonUserModule {}