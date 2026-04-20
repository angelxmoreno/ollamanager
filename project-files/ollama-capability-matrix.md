# Ollama Capability Matrix for OllaManager

## Scope

This matrix is for **remote Ollama server management**. A feature belongs in the UI only if it is:

- already present in the app, or
- directly available from the Ollama API, or
- clearly derivable from Ollama API responses

Source of truth:

- https://docs.ollama.com/api/introduction
- https://docs.ollama.com/api/tags
- https://docs.ollama.com/api/ps
- https://docs.ollama.com/api-reference/show-model-details
- https://docs.ollama.com/api-reference/get-version
- https://docs.ollama.com/api/generate
- https://docs.ollama.com/api/chat
- https://docs.ollama.com/api/embed
- https://docs.ollama.com/api/authentication

## Confirmed Available Now

### Server / connection

- Ollama version via `GET /api/version`
- server reachability / health via successful API access
- local vs cloud base URL distinction
- authenticated cloud access via API key for `https://ollama.com/api`

### Model library management

- installed model list via `GET /api/tags`
- model name, digest, modified time, size
- model details including format, family, parameter size, quantization
- richer model metadata via `POST /api/show`
- model capabilities from `POST /api/show` such as `completion` and `vision`
- pull model via `POST /api/pull`
- delete model via `DELETE /api/delete`
- copy / create / push endpoints exist in the API, even if the current app does not expose them yet

### Pull progress

- `POST /api/pull` supports streamed progress updates by default
- streamed pull updates can include:
  - `status`
  - `digest`
  - `total`
  - `completed`
- pull status phases can include manifest download, layer download, verification, manifest write, cleanup, and success

This is safe to represent as:

- active pull progress
- percent complete when `total` and `completed` are present
- current phase / current layer
- pull success or failure

### Runtime / loaded model state

- currently running models via `GET /api/ps`
- loaded model metadata
- `expires_at`
- `context_length`
- `size_vram`

Important: `size_vram` is usable as **runtime model memory footprint**, but it is not full remote hardware telemetry.

### Inference / generation surface

- text generation via `POST /api/generate`
- chat via `POST /api/chat`
- embeddings via `POST /api/embed`
- streaming responses
- optional thinking output
- optional structured output / format constraints on chat
- optional tool list on chat
- response timing and token metrics:
  - `total_duration`
  - `load_duration`
  - `prompt_eval_count`
  - `prompt_eval_duration`
  - `eval_count`
  - `eval_duration`
- optional logprobs on generation/chat when enabled

These metrics are available on responses initiated by the app. They do **not** imply a server-wide historical usage feed.

## Safe UI Opportunities Not Yet in the App

- **Running Models** view using `GET /api/ps`
- **Server Info** panel with version and connection/auth state
- **Model capability badges** from `POST /api/show`
- **Runtime metrics** for loaded models:
  - context length
  - VRAM footprint per loaded model
  - unload timing / keep-alive state
- **Inference console** for generate/chat requests
- **Embeddings utility** if you want OllaManager to become more than a library manager
- **Request stats panel** for prompt/output token counts and durations
- **Model operations** beyond pull/delete:
  - copy
  - create
  - push
- **Pull progress surface** for active downloads initiated through OllaManager
- **Recent actions / operations panel** for app-initiated work only

## App-Tracked vs API-Exposed

This distinction matters for design.

### API-exposed remote state

These come directly from Ollama and are safe to treat as remote server state:

- installed models
- running models
- model metadata
- model capabilities
- server version
- pull progress while the current pull request is active
- per-response inference metrics returned by generate/chat calls

### App-tracked operations

These are safe to show in the UI, but they are **not** a native Ollama server activity log. OllaManager would own this state:

- recent pulls started from the app
- deletes initiated from the app
- copy/create/push requests initiated from the app
- generate/chat/embed requests initiated from the app
- request success/failure history retained by the client

Recommended labels for UI surfaces:

- `Operations`
- `Active Operations`
- `Recent Actions`
- `Pull Progress`

Avoid implying that Ollama exposes:

- a server task queue
- a general activity feed
- inference history for requests not initiated by OllaManager

## Not Supported or Not Justified Yet

These should **not** drive the design unless you introduce another data source:

- remote host hardware inventory
- CPU / GPU utilization graphs
- full deployment / cluster management
- “engines,” “datasets,” or “remote clusters” as product concepts
- inference history or logs as a built-in Ollama server feature
- host-level filesystem or process telemetry

## Design Rule

For the next Stitch pass, constrain the product language to:

- connections
- server version / status
- installed models
- running models
- model details
- pull progress
- activity / task status
- optional inference console
- optional embeddings utility

Avoid adding UI sections for hardware, deployments, clusters, datasets, or logs unless a new verified backend source is added.
