    # Add Specialist Agents data
    try:
        # 1. Add all agents registered with 'spec-' prefix
        for agent_id_to_check in registry.list_ids():
            if agent_id_to_check.startswith("spec-") and agent_id_to_check != "spec-pendencias":
                spec_agent = registry.get(agent_id_to_check)
                if hasattr(spec_agent, "get_status"):
                    live_agents.append(spec_agent.get_status())
        
        # 2. Add Pendencias (Extraction) Agent data specifically (it has extra monitor_data)
        pend_data = _get_pendencias_status()
        pend_agent = {
            "agent": "spec-pendencias",
            "name": "Especialista em Pendências",
            "role": "Data Extractor",
            "tier": 2,
            "status": pend_data["status"],
            "status_detail": pend_data["status_detail"],
            "last_update": pend_data.get("last_run", datetime.now(timezone.utc).isoformat()),
            "metrics": pend_data["metrics"],
            "monitor_data": {
                "last_run": pend_data.get("last_run"),
                "next_run": pend_data.get("next_run")
            }
        }
        live_agents.append(pend_agent)
        
    except Exception as e:
        logger.error(f"Error adding specialists or pendencias agent: {e}")

    return [caio] + live_agents
