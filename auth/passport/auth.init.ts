import {passportSerializer} from "./shared.auth";
import passport from "passport";

export function init() {
    passportSerializer(passport)
}