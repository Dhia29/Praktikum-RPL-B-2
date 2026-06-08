<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('chat.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('chat.presence', function ($user) {
    return ['id' => $user->id];
});

Broadcast::channel('admin.notifications', function ($user) {
    return $user->role === 'ADMIN';
});
