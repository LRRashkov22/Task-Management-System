using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagementSystem.Modules.Teams.Application.Dto_s;
using TaskManagementSystem.Modules.Teams.Application.Interfaces;

namespace TaskManagementSystem.Modules.Teams.Presentation;

[ApiController]
[Route("api/teams")]
public class TeamsController : ControllerBase{
private readonly ICRUDTeamService teamService;
    public TeamsController(ICRUDTeamService teamService) { 
    this.teamService = teamService;
    }

    [Authorize(Roles = "Manager")]
    [HttpPost("create-team")]
    public async Task<ActionResult> CreateTeam(CreateTeamDto request) {
    var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var (teams, error) = await teamService.CreateTeamAsync(request, userid);
        if (error != null) return BadRequest(error);
        return Ok();
    }


    [Authorize(Roles = "Manager")]
    [HttpPatch("edit-team")]
    public async Task<ActionResult> EditTeam(EditTeamDto request)
    {
        var (teams, error) = await teamService.UpdateTeamAsync(request);
        if (error != null) return BadRequest(error);
        return Ok(teams);
    }

    [Authorize(Roles = "Manager")]
    [HttpDelete("remove-team/{id}")]
    public async Task<ActionResult> RemoveTeam(int id)
    {
        var (isDeleted, error) = await teamService.DeleteTeam(id);

        if (error != null)
            return BadRequest(error);

        return NoContent();
    }
}
   
