using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Security.Claims;
using TaskManagementSystem.Modules.Teams.Application.Dto_s;
using TaskManagementSystem.Data.Domain.Enums;
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
    [HttpPost("get-all-teams")]
    public async Task<ActionResult> GetTeam()
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var teams = await teamService.GetAllTeamsAsync(userid);
        return Ok(teams);
    }


}
   
