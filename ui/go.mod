module github.com/gptscript-ai/otto/ui

go 1.23.1

replace github.com/gptscript-ai/otto => ../

replace github.com/gptscript-ai/otto/apiclient => ../apiclient

replace github.com/gptscript-ai/otto/logger => ../logger

require (
	github.com/a-h/templ v0.2.778
	github.com/gptscript-ai/otto/apiclient v0.0.0-00010101000000-000000000000
)

require (
	github.com/getkin/kin-openapi v0.124.0 // indirect
	github.com/go-openapi/jsonpointer v0.20.2 // indirect
	github.com/go-openapi/swag v0.22.8 // indirect
	github.com/gptscript-ai/go-gptscript v0.9.5-rc5.0.20240920232051-64eaa0ac8caf // indirect
	github.com/gptscript-ai/otto/logger v0.0.0-00010101000000-000000000000 // indirect
	github.com/invopop/yaml v0.2.0 // indirect
	github.com/josharian/intern v1.0.0 // indirect
	github.com/mailru/easyjson v0.7.7 // indirect
	github.com/mohae/deepcopy v0.0.0-20170929034955-c48cc78d4826 // indirect
	github.com/perimeterx/marshmallow v1.1.5 // indirect
	github.com/sirupsen/logrus v1.9.3 // indirect
	golang.org/x/sys v0.25.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)
