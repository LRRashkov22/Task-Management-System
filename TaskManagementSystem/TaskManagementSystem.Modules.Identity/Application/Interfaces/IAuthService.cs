using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Modules.Identity.Application.DTOs;

namespace TaskManagementSystem.Modules.Identity.Application.Interfaces;

public interface IAuthService
{
    Task<(TokenResponseDto? tokenRespone, string? error)> LoginAsync(UserDto request);
    Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request);
    Task<(TokenResponseDto? tokenRespone, string? error)> ChangePassword(ChangePasswordDto request, int userid);
}
