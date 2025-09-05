"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { signUpHardCode } from "@/server/users";

const SignUp = () => {
  return (
    <div>
      <Button onClick={signUpHardCode}>asu</Button>
    </div>
  );
};
export default SignUp;
