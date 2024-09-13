package handlers

import (
	"fmt"
	"net/http"

	"github.com/gptscript-ai/go-gptscript"
	"github.com/gptscript-ai/otto/pkg/api"
	"github.com/gptscript-ai/otto/pkg/api/types"
	"github.com/gptscript-ai/otto/pkg/render"
	v1 "github.com/gptscript-ai/otto/pkg/storage/apis/otto.gptscript.ai/v1"
	"github.com/gptscript-ai/otto/pkg/system"
	"github.com/thedadams/workspace-provider/pkg/client"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type AgentHandler struct {
	workspaceClient   *client.Client
	workspaceProvider string
}

func NewAgentHandler(wc *client.Client, wp string) *AgentHandler {
	return &AgentHandler{
		workspaceClient:   wc,
		workspaceProvider: wp,
	}
}

func (a *AgentHandler) Update(req api.Context) error {
	var (
		id       = req.Request.PathValue("id")
		agent    v1.Agent
		manifest v1.AgentManifest
	)

	if err := req.Read(&manifest); err != nil {
		return err
	}

	if err := req.Get(&agent, id); err != nil {
		return err
	}

	agent.Spec.Manifest = manifest
	if err := req.Update(&agent); err != nil {
		return err
	}

	return req.Write(convertAgent(agent, api.GetURLPrefix(req)))
}

func (a *AgentHandler) Delete(req api.Context) error {
	var (
		id = req.Request.PathValue("id")
	)

	return req.Delete(&v1.Agent{
		ObjectMeta: metav1.ObjectMeta{
			Name:      id,
			Namespace: req.Namespace(),
		},
	})
}

func (a *AgentHandler) Create(req api.Context) error {
	var manifest v1.AgentManifest
	if err := req.Read(&manifest); err != nil {
		return err
	}
	agent := v1.Agent{
		ObjectMeta: metav1.ObjectMeta{
			GenerateName: system.AgentPrefix,
			Namespace:    req.Namespace(),
			Finalizers:   []string{v1.AgentFinalizer},
		},
		Spec: v1.AgentSpec{
			Manifest: manifest,
		},
	}

	if err := req.Create(&agent); err != nil {
		return err
	}

	req.WriteHeader(http.StatusCreated)
	return req.Write(convertAgent(agent, api.GetURLPrefix(req)))
}

func convertAgent(agent v1.Agent, prefix string) *types.Agent {
	var links []string
	if prefix != "" {
		slug := agent.Name
		if agent.Status.External.SlugAssigned && agent.Spec.Manifest.Slug != "" {
			slug = agent.Spec.Manifest.Slug
		}
		links = []string{"invoke", prefix + "/invoke/" + slug}
	}
	return &types.Agent{
		Metadata:            types.MetadataFrom(&agent, links...),
		AgentManifest:       agent.Spec.Manifest,
		AgentExternalStatus: agent.Status.External,
	}
}

func (a *AgentHandler) ByID(req api.Context) error {
	var agent v1.Agent
	if err := req.Get(&agent, req.PathValue("id")); err != nil {
		return err
	}

	return req.Write(convertAgent(agent, api.GetURLPrefix(req)))
}

func (a *AgentHandler) List(req api.Context) error {
	var agentList v1.AgentList
	if err := req.List(&agentList); err != nil {
		return err
	}

	var resp types.AgentList
	for _, agent := range agentList.Items {
		resp.Items = append(resp.Items, *convertAgent(agent, api.GetURLPrefix(req)))
	}

	return req.Write(resp)
}

func (a *AgentHandler) Files(req api.Context) error {
	var (
		id    = req.Request.PathValue("id")
		agent v1.Agent
	)
	if err := req.Get(&agent, id); err != nil {
		return fmt.Errorf("failed to get agent with id %s: %w", id, err)
	}

	return listFiles(req.Context(), req, a.workspaceClient, agent.Status.Workspace.WorkspaceID)
}

func (a *AgentHandler) UploadFile(req api.Context) error {
	var (
		id    = req.Request.PathValue("id")
		agent v1.Agent
	)
	if err := req.Get(&agent, id); err != nil {
		return fmt.Errorf("failed to get agent with id %s: %w", id, err)
	}

	return uploadFile(req.Context(), req, a.workspaceClient, agent.Status.Workspace.WorkspaceID)
}

func (a *AgentHandler) DeleteFile(req api.Context) error {
	var (
		id       = req.Request.PathValue("id")
		filename = req.Request.PathValue("file")
		agent    v1.Agent
	)

	if err := req.Get(&agent, id); err != nil {
		return fmt.Errorf("failed to get agent with id %s: %w", id, err)
	}

	return deleteFile(req.Context(), req, a.workspaceClient, agent.Status.Workspace.WorkspaceID, filename)
}

func (a *AgentHandler) Knowledge(req api.Context) error {
	var (
		id    = req.Request.PathValue("id")
		agent v1.Agent
	)
	if err := req.Get(&agent, id); err != nil {
		return fmt.Errorf("failed to get agent with id %s: %w", id, err)
	}

	return listFiles(req.Context(), req, a.workspaceClient, agent.Status.KnowledgeWorkspace.KnowledgeWorkspaceID)
}

func (a *AgentHandler) UploadKnowledge(req api.Context) error {
	var (
		id    = req.Request.PathValue("id")
		agent v1.Agent
	)
	if err := req.Get(&agent, id); err != nil {
		return fmt.Errorf("failed to get agent with id %s: %w", id, err)
	}

	return uploadKnowledge(req, a.workspaceClient, &agent, &agent.Status.KnowledgeWorkspace)
}

func (a *AgentHandler) DeleteKnowledge(req api.Context) error {
	var (
		id       = req.Request.PathValue("id")
		filename = req.Request.PathValue("file")
		agent    v1.Agent
	)

	if err := req.Get(&agent, id); err != nil {
		return fmt.Errorf("failed to get agent with id %s: %w", id, err)
	}

	return deleteKnowledge(req, a.workspaceClient, &agent, &agent.Status.KnowledgeWorkspace, filename)
}

func (a *AgentHandler) IngestKnowledge(req api.Context) error {
	var (
		id    = req.Request.PathValue("id")
		agent v1.Agent
	)
	if err := req.Get(&agent, id); err != nil {
		return fmt.Errorf("failed to get agent with id %s: %w", id, err)
	}

	return ingestKnowlege(req, a.workspaceClient, &agent, &agent.Status.KnowledgeWorkspace)
}

func (a *AgentHandler) Script(req api.Context) error {
	var (
		id    = req.Request.PathValue("id")
		agent v1.Agent
	)
	if err := req.Get(&agent, id); err != nil {
		return fmt.Errorf("failed to get agent with id %s: %w", id, err)
	}

	tools, _, err := render.Agent(req.Context(), req.Storage, &agent, render.AgentOptions{})
	if err != nil {
		return err
	}

	script, err := req.GPTClient.Fmt(req.Context(), gptscript.ToolDefsToNodes(tools))
	if err != nil {
		return err
	}

	return req.Write(script)
}
