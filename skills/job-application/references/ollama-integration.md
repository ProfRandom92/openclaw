# Ollama Integration for Job Application Agent

This guide explains how to use Ollama with the job application agent for privacy-focused, local LLM processing.

## Why Use Ollama?

- **Privacy:** Keep your CV data local, no external API calls
- **Cost:** No API costs for OpenAI/Anthropic
- **Speed:** Fast inference on local hardware
- **Offline:** Works without internet connection
- **Control:** Full control over model selection and parameters

## Installation

### Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

### Start Ollama Service

```bash
# Start Ollama server (runs in background)
ollama serve
```

## Recommended Models

### For Cover Letter Generation (Best Quality)

```bash
# Llama 3.3 70B (best quality, requires ~40GB RAM)
ollama pull llama3.3:70b

# Qwen 2.5 32B (good balance, requires ~20GB RAM)
ollama pull qwen2.5:32b

# Llama 3.1 8B (fastest, requires ~8GB RAM)
ollama pull llama3.1:8b
```

### For Job Analysis & Extraction (Fast)

```bash
# Qwen 2.5 7B (very fast, good for extraction)
ollama pull qwen2.5:7b

# Llama 3.2 3B (extremely fast, lightweight)
ollama pull llama3.2:3b
```

### For German Language (Specialized)

```bash
# Llama 3.1 with German fine-tuning
ollama pull llama3.1:8b-german

# Leo models (German-optimized)
ollama pull leo-hessianai:13b
```

## Configuration

### Set Default Ollama Model

```bash
# Set environment variable for OpenClaw
export OPENCLAW_MODEL=ollama:llama3.3:70b

# Or per-command
openclaw agent --message "Generate cover letter" --model ollama:llama3.3:70b
```

### Configure in OpenClaw

```bash
# Add Ollama as default provider
openclaw config set model.default ollama:llama3.3:70b

# Set Ollama endpoint (if not default)
openclaw config set ollama.endpoint http://localhost:11434
```

## Usage Examples

### Generate Cover Letter with Ollama

```bash
# Using default model
OPENCLAW_MODEL=ollama:llama3.3:70b ./scripts/generate-cover-letter.sh https://job-url.com

# Using specific model
OPENCLAW_MODEL=ollama:qwen2.5:32b ./scripts/generate-cover-letter.sh https://job-url.com "NVIDIA" "AI Engineer"
```

### Job Search with Ollama

```bash
# Use fast model for job analysis
OPENCLAW_MODEL=ollama:qwen2.5:7b ./scripts/search-jobs.sh "AI Developer" "Germany"
```

### Interactive Agent with Ollama

```bash
# Start agent session with Ollama
openclaw agent --model ollama:llama3.3:70b

# Example commands in the session:
# "Search for AI jobs in Germany"
# "Generate cover letter for this job: https://..."
# "Track application status"
```

## OpenClaw + Ollama Integration (Clawdbot)

OpenClaw has official Ollama integration. See: https://docs.ollama.com/integrations/clawdbot

### Setup ClawdBot with Ollama

1. Install both OpenClaw and Ollama
2. Configure OpenClaw to use Ollama backend:

```bash
# Add Ollama model to OpenClaw
openclaw config set models.available.ollama true

# Set default model
openclaw config set model.default ollama:llama3.3:70b
```

3. Use via any OpenClaw channel (Telegram, WhatsApp, Discord, etc.):

```
You: Generate a cover letter for this job: [URL]
ClawdBot: [generates locally using Ollama, keeping data private]
```

## Model Selection Guide

### Cover Letter Generation

| Model | Quality | Speed | RAM Required | Recommendation |
|-------|---------|-------|--------------|----------------|
| llama3.3:70b | ★★★★★ | ★★☆☆☆ | 40GB | Best for final letters |
| qwen2.5:32b | ★★★★☆ | ★★★☆☆ | 20GB | Good balance |
| llama3.1:8b | ★★★☆☆ | ★★★★★ | 8GB | Fast drafts |

### Job Analysis & Extraction

| Model | Accuracy | Speed | RAM Required | Recommendation |
|-------|----------|-------|--------------|----------------|
| qwen2.5:7b | ★★★★☆ | ★★★★★ | 7GB | Best for analysis |
| llama3.2:3b | ★★★☆☆ | ★★★★★ | 3GB | Very fast |
| llama3.1:8b | ★★★★☆ | ★★★★☆ | 8GB | Good balance |

## Performance Optimization

### Use Quantized Models

```bash
# 4-bit quantized (faster, less RAM)
ollama pull llama3.3:70b-q4

# 8-bit quantized (good balance)
ollama pull llama3.3:70b-q8
```

### GPU Acceleration

```bash
# Ollama automatically uses GPU if available
# Check GPU usage:
ollama ps

# Force CPU-only (if needed):
OLLAMA_GPU=0 ollama serve
```

### Parallel Processing

```bash
# Set number of parallel requests
export OLLAMA_NUM_PARALLEL=4

# Set context size
export OLLAMA_CONTEXT_SIZE=4096
```

## Privacy & Security

### Data Handling

- All CV data stays on your local machine
- No data sent to external APIs
- Job postings fetched but processed locally
- Cover letters generated entirely locally

### Best Practices

1. **Don't expose Ollama API:** Keep `http://localhost:11434` local
2. **Use firewall:** Block external access to port 11434
3. **Encrypt storage:** Ensure `~/.openclaw/` is on encrypted drive
4. **Review outputs:** Always review generated cover letters before sending

## Troubleshooting

### Ollama Not Found

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama service
ollama serve
```

### Out of Memory

```bash
# Use smaller model
ollama pull llama3.1:8b

# Or use quantized version
ollama pull llama3.3:70b-q4
```

### Slow Generation

```bash
# Use faster model for drafts
export OPENCLAW_MODEL=ollama:qwen2.5:7b

# Then use larger model for final version
OPENCLAW_MODEL=ollama:llama3.3:70b ./scripts/generate-cover-letter.sh [url]
```

### Connection Refused

```bash
# Check Ollama status
systemctl status ollama  # Linux
brew services list | grep ollama  # macOS

# Restart Ollama
ollama serve
```

## Advanced Usage

### Custom Prompts with Ollama

```bash
# Create custom prompt template
cat > custom-prompt.txt <<'EOF'
You are a professional German cover letter writer.
Generate a cover letter for:
Company: {{COMPANY}}
Position: {{POSITION}}
CV: {{CV_DATA}}
Job: {{JOB_DATA}}
EOF

# Use with Ollama
ollama run llama3.3:70b "$(cat custom-prompt.txt | envsubst)"
```

### Batch Processing

```bash
# Process multiple jobs at once
for job_url in $(cat job-urls.txt); do
  OPENCLAW_MODEL=ollama:llama3.3:70b ./scripts/generate-cover-letter.sh "$job_url" &
done
wait
```

### Quality Comparison

```bash
# Generate with different models and compare
for model in llama3.1:8b qwen2.5:32b llama3.3:70b; do
  OPENCLAW_MODEL=ollama:$model ./scripts/generate-cover-letter.sh [url]
  mv cover-letters/cover-letter-*.md cover-letters/cover-letter-$model.md
done

# Review all versions
ls -lh cover-letters/
```

## Integration with OpenClaw Features

### Cron Jobs with Ollama

```bash
# Daily job search using Ollama
openclaw cron add \
  --name "Daily Job Search (Ollama)" \
  --schedule "0 9 * * *" \
  --command "OPENCLAW_MODEL=ollama:qwen2.5:7b openclaw agent --message 'Run daily job search'" \
  --deliver telegram:me
```

### Multi-Channel with Ollama

```bash
# Configure Telegram bot with Ollama
openclaw config set telegram.model ollama:llama3.3:70b

# Configure Discord bot with Ollama
openclaw config set discord.model ollama:qwen2.5:32b

# Configure WhatsApp with Ollama
openclaw config set whatsapp.model ollama:llama3.1:8b
```

## Cost & Performance Comparison

| Approach | Cost/Month | Privacy | Speed | Quality |
|----------|-----------|---------|-------|---------|
| Ollama (local) | $0 | ★★★★★ | ★★★★☆ | ★★★★☆ |
| OpenAI API | $50-200 | ★★☆☆☆ | ★★★★★ | ★★★★★ |
| Anthropic API | $40-150 | ★★☆☆☆ | ★★★★☆ | ★★★★★ |
| Hybrid | $10-50 | ★★★★☆ | ★★★★★ | ★★★★★ |

**Recommended:** Use Ollama for initial drafts and sensitive data, then optionally use cloud APIs for final polish.

## Resources

- [Ollama Official Site](https://ollama.com)
- [Ollama Models Library](https://ollama.com/library)
- [OpenClaw Ollama Integration](https://docs.ollama.com/integrations/clawdbot)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [Model Benchmarks](https://ollama.com/blog/model-benchmarks)
