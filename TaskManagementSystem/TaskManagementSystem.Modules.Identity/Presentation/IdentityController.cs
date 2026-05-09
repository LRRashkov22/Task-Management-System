using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Identity.Application.Interfaces;
using TaskManagementSystem.Modules.Identity.Application.UserDto_s;
using TaskManagementSystem.Modules.Identity.Infrastructure.Service;

namespace TaskManagementSystem.Modules.Identity.Presentation;

[ApiController]
[Route("api/identity")]
public class IdentityController(IAuthService AuthService, ICreateUser createUser) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<TokenResponseDto>> login(UserDto request)
    {
        var (result, error) = await AuthService.LoginAsync(request);
        if (error != null) return BadRequest(error);
        return Ok(result);
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

    [Authorize(Roles = "Admin")]
    [HttpPost("create-user")]
    public async Task<ActionResult> CreateUser(CreateUserDto request)
    {
        var (result, error) = await createUser.RegisterUser(request);
        if (error != null) return BadRequest(error);
        return Ok();
    }
    [Authorize(Roles = "Admin")]
    [HttpGet("managers")]
    public async Task<ActionResult<List<UserDto>>> GetAllManagers()
    {
        var result = await createUser.GetAllUsersByRole(Role.Manager);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("employee")]
    public async Task<ActionResult<List<UserDto>>> GetAllEmployees()
    {
        var result = await createUser.GetAllUsersByRole(Role.Employee);
        return Ok(result);
    }


}