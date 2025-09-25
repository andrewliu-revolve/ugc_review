import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "s3.amazonaws.com",
			},
			{
				protocol: "http",
				hostname: "s3.amazonaws.com",
			},
			{
				protocol: "https",
				hostname: "cdn-yotpo-images-production.yotpo.com",
			},
			{
				protocol: "https",
				hostname: "media.istockphoto.com",
			},
		],
	},
};

export default nextConfig;
