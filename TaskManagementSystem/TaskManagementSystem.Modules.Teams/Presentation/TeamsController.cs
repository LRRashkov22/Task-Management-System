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


    [Authorize(Roles = "Manager,Admin")]
    [HttpPatch("transfer-team-ownership")]
    public async Task<ActionResult> TransferTeam(TransferDto request)
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var isAdmin = User.IsInRole("Admin");

        var (status, error) = await teamService.TransferTeamAsync(request, userid, isAdmin);
        if (error != null)  return BadRequest(error);
        return Ok(status);
    }

    [Authorize(Roles = "Manager")]
    [HttpPatch("edit-team")]
    public async Task<ActionResult> EditTeam(EditTeamDto request)
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var (teams, error) =  await teamService.UpdateTeamAsync(request, userid);
        if (error != null) return BadRequest(error);
        return Ok(teams);
    }

    [Authorize(Roles = "Manager")]
    [HttpPatch("remove-team")]
    public async Task<ActionResult> RemoveTeam(RecoverOrArchiveDto request)
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var (isDeleted, error) = await teamService.ArchiveTeam(request, userid);

        if (error != null)
            return BadRequest(error);

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("recover-team")]
    public async Task<ActionResult> RecoverTeam(RecoverOrArchiveDto request) {
    var team = await teamService.AdminRecoverTeam(request);
        return Ok(team);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("force-delete-team/{teamId}")]
    public async Task<ActionResult> ForceDeleteTeam(int teamId)
    {
        var (status, error) = await teamService.DeleteArchivedTeamAsync(teamId);

        if (error != null) return BadRequest(error);

        return Ok(status);
    }
}
   
