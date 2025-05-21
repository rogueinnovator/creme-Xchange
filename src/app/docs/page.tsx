"use client";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
const page = () => {
  return (
    <div className="bg-white">
      <h2 className="flex justify-center items-center text-xl text-black mt-10">API Doc</h2>
      <SwaggerUI url="/docs/main.json" />
    </div>
  );
};
export default page;
