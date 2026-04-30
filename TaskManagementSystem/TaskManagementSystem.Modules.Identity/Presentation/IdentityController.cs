using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using TaskManagementSystem.Modules.Identity.Application.Interfaces;
using TaskManagementSystem.Modules.Identity.Application.UserDto_s;

namespace TaskManagementSystem.Modules.Identity.Presentation;

[ApiController]
[Route("api/identity")]
public class IdentityController(IAuthService AuthService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<TokenResponseDto>> login(UserDto request)
    {
        var (result, error) = await AuthService.LoginAsync(request);
        if (error != null) return BadRequest(error);
        return Ok(result);
    }

    [Authorize]
    [HttpGet]
    public IActionResult AuthenticatedOnlyEndpoint()
    {
        return Ok("You are authenticated and can access this endpoint.");
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("Admin-only")]
    public IActionResult AdminOnlyEndpoint()
    {
        return Ok("You are Admin.");
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<TokenResponseDto>> RefreshToken(RefreshTokenRequestDto requestDto)
    {
        var result = await AuthService.RefreshTokensAsync(requestDto);
        if (result is null) return Unauthorized("Invalid refresh token");
        return Ok(result);
    }
}