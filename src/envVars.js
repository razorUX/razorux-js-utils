function validateEnvVars(envVars) {
	envVars.forEach(envVar => {
		if(!process.env[envVar]) throw `Missing required env var "${envVar}"`;
	})
}

exports.validateEnvVars = validateEnvVars;