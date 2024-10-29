package types

type KnowledgeFileState string

const (
	KnowledgeFileStatePending   KnowledgeFileState = "pending"
	KnowledgeFileStateIngesting KnowledgeFileState = "ingesting"
	KnowledgeFileStateIngested  KnowledgeFileState = "ingested"
	KnowledgeFileStateError     KnowledgeFileState = "error"

	// KnowledgeFileStateUnapproved This is only a public API state, not a real orchestration state
	KnowledgeFileStateUnapproved KnowledgeFileState = "unapproved"
	// KnowledgeFileStatePendingApproval This is only a public API state, not a real orchestration state
	KnowledgeFileStatePendingApproval KnowledgeFileState = "pending-approval"
)

func (k KnowledgeFileState) IsTerminal() bool {
	return k == KnowledgeFileStateIngested || k == KnowledgeFileStateError
}

type KnowledgeFile struct {
	Metadata
	FileName               string             `json:"fileName"`
	State                  KnowledgeFileState `json:"state"`
	AgentID                string             `json:"agentID,omitempty"`
	ThreadID               string             `json:"threadID,omitempty"`
	KnowledgeSetID         string             `json:"knowledgeSetID,omitempty"`
	KnowledgeSourceID      string             `json:"knowledgeSourceID,omitempty"`
	Approved               *bool              `json:"approved,omitempty"`
	URL                    string             `json:"url,omitempty"`
	UpdatedAt              string             `json:"updatedAt,omitempty"`
	Checksum               string             `json:"checksum,omitempty"`
	LastIngestionStartTime *Time              `json:"lastIngestionStartTime,omitempty"`
	LastIngestionEndTime   *Time              `json:"lastIngestionEndTime,omitempty"`
	LastRunID              string             `json:"lastRunID,omitempty"`
}

type KnowledgeFileList List[KnowledgeFile]
