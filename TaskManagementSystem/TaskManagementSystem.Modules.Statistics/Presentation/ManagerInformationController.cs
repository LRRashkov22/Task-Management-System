using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Statistics.Application.DTO_s;
using TaskManagementSystem.Modules.Statistics.Application.Interface;

namespace TaskManagementSystem.Modules.Statistics.Presentation;
[ApiController]
[Route("api/Statistics/Manager")]

public class ManagerInformationController : ControllerBase
{
    private readonly IGetManagerInformation managerInfo;
    public ManagerInformationController(IGetManagerInformation managerInfo)
    {
        this.managerInfo = managerInfo;
    }

    //request when team page need to load
    [Authorize(Roles = "Manager")]
    [HttpGet("get-all-teams")]
    public async Task<ActionResult> GetTeam()
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var teams = await managerInfo.GetAllTeamsListAsync(userid);
        return Ok(teams);
    }

    [Authorize(Roles = "Manager")]
    [HttpGet("my-teams")]
    public async Task<ActionResult> GetMyTeams()
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var teams = await managerInfo.GetManagerTeamsAsync(userid);
        return Ok(teams);
    }

    [Authorize(Roles = "Manager")]
    [HttpGet("transfer-preview/{teamId}")]
    public async Task<ActionResult> GetTransferPreview(int teamId)
    {
        var (preview, error)  = await managerInfo.GetTransferTeamPreviewAsync(teamId);

        if (error != null)
            return BadRequest(error);

        return Ok(preview);
    }

    //request when show detail button clicked
    [Authorize(Roles = "Manager")]
    [HttpGet("get-team-details/{id}")]
    public async Task<ActionResult> GetTeamDetails(int id)
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var team = await managerInfo.GetTeamDetailsAsync(userid, id);
        if (team == null) return NotFound();
        return Ok(team);
    }
}
