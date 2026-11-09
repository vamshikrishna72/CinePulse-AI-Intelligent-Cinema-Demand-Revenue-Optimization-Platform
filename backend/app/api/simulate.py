"""
CinePulse AI - What-If Scenario Simulation Endpoint
"""

from fastapi import APIRouter, HTTPException
from backend.app.schemas.show import SimulationRequest, SimulationResponse
from backend.app.services.simulator_service import SimulatorService

router = APIRouter(prefix="/simulate", tags=["Simulator"])
simulator_service = SimulatorService()


@router.post("", response_model=SimulationResponse)
def simulate_counterfactual_show(request: SimulationRequest):
    """
    Run paired counterfactual simulation:
    Evaluates original vs modified operational parameters using the
    actual champion model pipeline with explicit causal governance.
    """
    try:
        response = simulator_service.simulate_scenario(
            request.base_scenario,
            request.simulated_scenario,
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")
